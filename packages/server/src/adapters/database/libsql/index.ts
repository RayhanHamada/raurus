import { createClient } from "@libsql/client";
import { FAILURE_CODES } from "@raurus/core";
import type { RuntimeDatabaseAdapterBaseConfig, RuntimeDatabaseAdapterFactory } from "@raurus/core";

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

    client.execute(`
        CREATE TABLE IF NOT EXISTS raurus_metadata (
            placeholder_id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            asset_key TEXT,
            text_content TEXT,
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);

    return {
        id: "libsql-database-adapter",
        apiVersion: "1",

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
            const { type } = payload;
            const assetKey = type === "text" ? null : payload.assetKey;
            const textContent = type === "text" ? payload.text : null;

            try {
                client.execute(
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
