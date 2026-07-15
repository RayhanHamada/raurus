import { createClient } from "@libsql/client";
import { METADATA_TYPES } from "@raurus/contract";
import { getLogger } from "@raurus/logger";

import { FAILURE_CODES } from "@/core";
import type { RaurusMetadataWithPath, RuntimeDatabaseAdapterBaseConfig, RuntimeDatabaseAdapterFactory } from "@/core";

const log = getLogger("server");

export interface LibsqlMetadataAdapterConfig extends RuntimeDatabaseAdapterBaseConfig {
    /**
     * @see {@link https://github.com/libsql/libsql-client-ts#supported-urls}
     */
    url: string;
    authToken?: string;
}

export const libSqlDatabaseAdapter: RuntimeDatabaseAdapterFactory<LibsqlMetadataAdapterConfig> = (config) => {
    if (!config?.url) {
        throw new Error("Missing required configuration: url");
    }

    const c = config;
    const client = c.authToken ? createClient({ url: c.url, authToken: c.authToken }) : createClient({ url: c.url });

    return {
        id: "libsql-database-adapter",
        apiVersion: "1",

        async init() {
            log.info("Initializing libsql database adapter", { url: c.url });

            // Check whether the definitions table already exists.
            let result = await client.execute(
                `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'raurus_placeholder_definitions'`
            );
            if (result.rows.length === 0) {
                await client.execute(`
                    CREATE TABLE IF NOT EXISTS raurus_placeholder_definitions (
                        placeholder_id TEXT PRIMARY KEY,
                        type TEXT NOT NULL,
                        created_at TEXT NOT NULL DEFAULT (datetime('now'))
                    )
                `);
                log.info("Created raurus_placeholder_definitions table");
            }

            // Check whether the metadata table already exists.
            result = await client.execute(
                `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'raurus_metadata'`
            );
            if (result.rows.length === 0) {
                await client.execute(`
                    CREATE TABLE IF NOT EXISTS raurus_metadata (
                        placeholder_id TEXT NOT NULL,
                        pathname TEXT NOT NULL,
                        type TEXT NOT NULL,
                        asset_key TEXT,
                        text_content TEXT,
                        link_url TEXT,
                        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                        PRIMARY KEY (placeholder_id, pathname)
                    )
                `);
                log.info("Created raurus_metadata table");
            } else {
                // If the table already exists from a prior schema version
                // (single-column PK on placeholder_id), we need to recreate it.
                // Check whether the old schema is in place by looking at the PK.
                const pkInfo = await client.execute(`PRAGMA table_info('raurus_metadata')`);
                const hasPathname = pkInfo.rows.some((row) => row["name"] === "pathname");
                if (!hasPathname) {
                    log.info("Migrating raurus_metadata table to composite primary key");
                    await client.execute("DROP TABLE IF EXISTS raurus_metadata");
                    await client.execute(`
                        CREATE TABLE raurus_metadata (
                            placeholder_id TEXT NOT NULL,
                            pathname TEXT NOT NULL,
                            type TEXT NOT NULL,
                            asset_key TEXT,
                            text_content TEXT,
                            link_url TEXT,
                            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                            PRIMARY KEY (placeholder_id, pathname)
                        )
                    `);
                    log.info("Recreated raurus_metadata table with composite primary key");
                }
            }

            log.info("libsql database adapter initialized");
        },

        async close() {
            log.info("Closing libsql database adapter");
            client.close();
        },

        async checkConnection() {
            try {
                await client.execute("SELECT 1");
                return {
                    ok: true,
                    data: null,
                };
            } catch (error) {
                return {
                    ok: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                    code: FAILURE_CODES.CONNECTION,
                };
            }
        },

        async getOrSeedPlaceholderDefinition(placeholderId, type) {
            try {
                // Attempt to insert the definition. ON CONFLICT DO NOTHING
                // is atomic — if a row already exists, this is a no-op.
                await client.execute(
                    `INSERT INTO raurus_placeholder_definitions (placeholder_id, type) VALUES (?, ?)
                     ON CONFLICT(placeholder_id) DO NOTHING`,
                    [placeholderId, type]
                );

                // Read back the actual type (either newly inserted or pre-existing).
                const result = await client.execute(
                    `SELECT type FROM raurus_placeholder_definitions WHERE placeholder_id = ?`,
                    [placeholderId]
                );

                if (result.rows.length === 0) {
                    return {
                        ok: false,
                        error: new Error(`Failed to seed placeholder definition for "${placeholderId}"`),
                        code: FAILURE_CODES.UNKNOWN,
                    };
                }

                const [firstRow] = result.rows;
                if (!firstRow) {
                    return {
                        ok: false,
                        error: new Error(`No definition row found for "${placeholderId}"`),
                        code: FAILURE_CODES.UNKNOWN,
                    };
                }
                const actualType = firstRow["type"] as string;
                if (actualType !== type) {
                    return {
                        ok: false,
                        error: new Error(
                            `"${placeholderId}" is defined as "${actualType}", cannot upsert as "${type}"`
                        ),
                        code: FAILURE_CODES.CONFLICT,
                    };
                }

                return { ok: true, data: null };
            } catch (error) {
                return {
                    ok: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                    code: FAILURE_CODES.UPSTREAM,
                };
            }
        },

        async upsertContentMetadata(placeholderId, pathname, payload) {
            let assetKey: string | null = null;
            let textContent: string | null = null;
            let linkUrl: string | null = null;

            const { type } = payload;

            if (type === METADATA_TYPES.PHOTO) {
                ({ assetKey } = payload);
            } else if (type === METADATA_TYPES.TEXT) {
                ({ text: textContent } = payload);
            } else if (type === METADATA_TYPES.LINK) {
                ({ text: textContent, link: linkUrl } = payload);
            }

            try {
                await client.execute(
                    `
                    INSERT INTO raurus_metadata (placeholder_id, pathname, type, asset_key, text_content, link_url, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                    ON CONFLICT(placeholder_id, pathname) DO UPDATE SET
                        type = excluded.type,
                        asset_key = excluded.asset_key,
                        text_content = excluded.text_content,
                        link_url = excluded.link_url,
                        updated_at = datetime('now')
                    `,
                    [placeholderId, pathname, type, assetKey, textContent, linkUrl]
                );

                return {
                    ok: true,
                    data: null,
                };
            } catch (error) {
                return {
                    ok: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                    code: FAILURE_CODES.UPSTREAM,
                };
            }
        },

        async listContentMetadataByPath(pathname) {
            try {
                const result = await client.execute(
                    `SELECT placeholder_id, pathname, type, asset_key, text_content, link_url
                     FROM raurus_metadata WHERE pathname = ?`,
                    [pathname]
                );

                const data: RaurusMetadataWithPath[] = [];

                for (const row of result.rows) {
                    const type = row["type"] as string;

                    if (type === METADATA_TYPES.TEXT) {
                        data.push({
                            placeholderId: row["placeholder_id"] as string,
                            pathname: row["pathname"] as string,
                            type: METADATA_TYPES.TEXT,
                            text: (row["text_content"] as string) ?? "",
                        });
                    } else if (type === METADATA_TYPES.LINK) {
                        data.push({
                            placeholderId: row["placeholder_id"] as string,
                            pathname: row["pathname"] as string,
                            type: METADATA_TYPES.LINK,
                            text: (row["text_content"] as string) ?? "",
                            link: (row["link_url"] as string) ?? "",
                        });
                    } else if (type === METADATA_TYPES.PHOTO) {
                        data.push({
                            placeholderId: row["placeholder_id"] as string,
                            pathname: row["pathname"] as string,
                            type: METADATA_TYPES.PHOTO,
                            assetKey: (row["asset_key"] as string) ?? "",
                        });
                    }
                    // Unknown type — skip
                }

                return { ok: true as const, data };
            } catch (error) {
                return {
                    ok: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                    code: FAILURE_CODES.UPSTREAM,
                };
            }
        },
    };
};
