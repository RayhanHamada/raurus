import { createClient } from "@libsql/client";
import { METADATA_TYPES } from "@raurus/contract";
import { getLogger } from "@raurus/logger";

import { FAILURE_CODES } from "@/core";
import type { RuntimeDatabaseAdapterBaseConfig, RuntimeDatabaseAdapterFactory } from "@/core";

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

            // Check whether the metadata table already exists.
            const result = await client.execute(
                `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'raurus_metadata'`
            );
            if (result.rows.length > 0) {
                log.info("libsql database adapter already initialized — skipping");
                return;
            }

            // Create the metadata table.
            await client.execute(`
                CREATE TABLE IF NOT EXISTS raurus_metadata (
                    placeholder_id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    asset_key TEXT,
                    text_content TEXT,
                    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
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

        async upsertContentMetadata(placeholderId, _path, payload) {
            // Upsert the metadata into the database
            let assetKey: string | null = null;
            let textContent: string | null = null;

            const { type } = payload;

            if (type === METADATA_TYPES.PHOTO) {
                ({ assetKey } = payload);
            } else if (type === METADATA_TYPES.TEXT) {
                ({ text: textContent } = payload);
            } else if (type === METADATA_TYPES.LINK) {
                ({ link: textContent } = payload);
            }

            try {
                await client.execute(
                    `
                    INSERT INTO raurus_metadata (placeholder_id, type, asset_key, text_content, updated_at)
                    VALUES (?, ?, ?, ?, datetime('now'))
                    ON CONFLICT(placeholder_id) DO UPDATE SET
                        type = excluded.type,
                        asset_key = excluded.asset_key,
                        text_content = excluded.text_content,
                        updated_at = datetime('now')
                    `,
                    [placeholderId, type, assetKey, textContent]
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

        async listContentMetadataByPath(_path) {
            // List metadata by path

            return {
                ok: true,
                data: [],
            };
        },
    };
};
