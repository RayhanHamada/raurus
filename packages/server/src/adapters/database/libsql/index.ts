import { createClient } from "@libsql/client";
import type { RaurusMetadata, RuntimeDatabaseAdapterBaseConfig, RuntimeDatabaseAdapterFactory } from "@raurus/core";

interface LibsqlMetadataAdapterConfig extends RuntimeDatabaseAdapterBaseConfig {
    /**
     * @see {@link https://github.com/libsql/libsql-client-ts#supported-urls}
     */
    url: string;
    authToken?: string;
}

interface MetadataRow {
    placeholder_id: string;
    type: string;
    asset_key: string | null;
    text_content: string | null;
}

function rowToRaurusMetadata(row: MetadataRow): RaurusMetadata {
    if (row.type === "photo" || row.type === "video") {
        return {
            placeholderId: row.placeholder_id,
            type: row.type as "photo" | "video",
            assetKey: row.asset_key ?? "",
        };
    }
    return {
        placeholderId: row.placeholder_id,
        type: "text",
        text: row.text_content ?? "",
    };
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
                return { ok: true, data: null };
            } catch (error) {
                return {
                    ok: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                    code: "CONNECTION" as const,
                };
            }
        },

        async getMetadata(placeholderId) {
            try {
                const result = await client.execute({
                    sql: "SELECT * FROM raurus_metadata WHERE placeholder_id = ?",
                    args: [placeholderId],
                });

                if (result.rows.length === 0) {
                    return { ok: true, data: null };
                }

                return { ok: true, data: rowToRaurusMetadata(result.rows[0] as unknown as MetadataRow) };
            } catch (error) {
                return {
                    ok: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                    code: "CONNECTION" as const,
                };
            }
        },

        async bulkGetMetadataByPlaceholderIds(placeholderIds) {
            try {
                if (placeholderIds.length === 0) {
                    const result = await client.execute("SELECT * FROM raurus_metadata");
                    return {
                        ok: true,
                        data: (result.rows as unknown as MetadataRow[]).map(rowToRaurusMetadata),
                    };
                }

                const placeholders = placeholderIds.map(() => "?").join(", ");
                const result = await client.execute({
                    sql: `SELECT * FROM raurus_metadata WHERE placeholder_id IN (${placeholders})`,
                    args: placeholderIds,
                });

                return {
                    ok: true,
                    data: (result.rows as unknown as MetadataRow[]).map(rowToRaurusMetadata),
                };
            } catch (error) {
                return {
                    ok: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                    code: "CONNECTION" as const,
                };
            }
        },

        async upsertContentMetadata(placeholderId, type, assetKeyOrText) {
            try {
                const isAsset = type === "photo" || type === "video";

                await client.execute({
                    sql: `INSERT INTO raurus_metadata (
                            placeholder_id,
                            type,
                            ${isAsset ? "asset_key" : "text_content"},
                            updated_at
                        )
                        VALUES (?, ?, ?, datetime('now'))
                        ON CONFLICT(placeholder_id) DO UPDATE SET
                            type = excluded.type,
                            asset_key = ${isAsset ? "excluded.asset_key" : "NULL"},
                            text_content = ${isAsset ? "NULL" : "excluded.text_content"},
                            updated_at = excluded.updated_at`,
                    args: [placeholderId, type, assetKeyOrText],
                });
                return { ok: true, data: null };
            } catch (error) {
                return {
                    ok: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                    code: "CONNECTION" as const,
                };
            }
        },
    };
};
