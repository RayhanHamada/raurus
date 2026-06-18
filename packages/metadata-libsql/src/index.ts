import type { RaurusMetadata, RuntimeMetadataAdapterBaseConfig, RuntimeMetadataAdapterFactory } from "@raurus/core";
import { createClient } from "@libsql/client";

interface LibsqlMetadataAdapterConfig extends RuntimeMetadataAdapterBaseConfig {
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
            assetKey: row.asset_key!,
        };
    }
    return {
        placeholderId: row.placeholder_id,
        type: "text",
        text: row.text_content!,
    };
}

export const createLibsqlMetadataAdapter: RuntimeMetadataAdapterFactory<
    LibsqlMetadataAdapterConfig,
    "libsql-metadata-adapter"
> = (config) => {
    const c = config!;
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
        id: "libsql-metadata-adapter",
        apiVersion: "1",

        async checkConnection() {
            try {
                await client.execute("SELECT 1");
                return { ok: true, data: null };
            } catch (err) {
                return {
                    ok: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                    code: "CONNECTION" as const,
                };
            }
        },

        async getMetadataByPlaceholderId(placeholderId) {
            try {
                const result = await client.execute({
                    sql: "SELECT * FROM raurus_metadata WHERE placeholder_id = ?",
                    args: [placeholderId],
                });

                if (result.rows.length === 0) {
                    return { ok: true, data: null };
                }

                return { ok: true, data: rowToRaurusMetadata(result.rows[0] as unknown as MetadataRow) };
            } catch (err) {
                return {
                    ok: false,
                    error: err instanceof Error ? err : new Error(String(err)),
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
            } catch (err) {
                return {
                    ok: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                    code: "CONNECTION" as const,
                };
            }
        },

        async upsertContentMetadata(placeholderId, type, assetKeyOrText) {
            try {
                if (type === "photo" || type === "video") {
                    await client.execute({
                        sql: `INSERT INTO raurus_metadata (placeholder_id, type, asset_key, updated_at)
                              VALUES (?, ?, ?, datetime('now'))
                              ON CONFLICT(placeholder_id) DO UPDATE SET
                              type = excluded.type,
                              asset_key = excluded.asset_key,
                              text_content = NULL,
                              updated_at = excluded.updated_at`,
                        args: [placeholderId, type, assetKeyOrText],
                    });
                } else {
                    await client.execute({
                        sql: `INSERT INTO raurus_metadata (placeholder_id, type, text_content, updated_at)
                              VALUES (?, ?, ?, datetime('now'))
                              ON CONFLICT(placeholder_id) DO UPDATE SET
                              type = excluded.type,
                              text_content = excluded.text_content,
                              asset_key = NULL,
                              updated_at = excluded.updated_at`,
                        args: [placeholderId, type, assetKeyOrText],
                    });
                }
                return { ok: true, data: null };
            } catch (err) {
                return {
                    ok: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                    code: "CONNECTION" as const,
                };
            }
        },
    };
};
