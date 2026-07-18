import type { Config } from "@libsql/client";
import { createClient } from "@libsql/client";
import { METADATA_TYPES } from "@raurus/contract";
import { getLogger } from "@raurus/logger";

import { FAILURE_CODES } from "@/core";
import type { RaurusMetadataWithPath, RuntimeDatabaseAdapterBaseConfig, RuntimeDatabaseAdapterFactory } from "@/core";

const adapterId = `libsql-database-adapter`;
const log = getLogger("server", adapterId);

export interface LibsqlMetadataAdapterConfig extends RuntimeDatabaseAdapterBaseConfig {
    /**
     * libsql `createClient` config
     */
    config: Config;
}

export const libSqlDatabaseAdapter: RuntimeDatabaseAdapterFactory<LibsqlMetadataAdapterConfig> = ({ config }) => {
    const client = createClient(config);

    return {
        id: adapterId,
        apiVersion: "1",

        async init() {
            log.info("Initializing libsql database adapter");

            // Use raurus_placeholders as the sentinel table.
            const result = await client.execute(
                `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'raurus_placeholders'`
            );
            if (result.rows.length > 0) {
                log.info("libsql database adapter already initialized — skipping");
                return;
            }

            await client.execute(`
                CREATE TABLE IF NOT EXISTS raurus_placeholders (
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
                    INSERT INTO raurus_placeholders (placeholder_id, pathname, type, asset_key, text_content, link_url, updated_at)
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
                     FROM raurus_placeholders WHERE pathname = ?`,
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
