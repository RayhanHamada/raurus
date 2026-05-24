import type { AssetRecord, MetadataAdapter } from "@raurus/core";
import Database from "better-sqlite3";

export interface SqliteMetadataAdapterOptions {
    dbPath: string;
}

interface AssetRow {
    asset_key: string;
    id: string;
    mime_type: string;
    updated_at: string;
    url: string;
}

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS editable_assets (
  id TEXT PRIMARY KEY,
  asset_key TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

const toAssetRecord = (row: AssetRow): AssetRecord => ({
    assetKey: row.asset_key,
    id: row.id,
    mimeType: row.mime_type,
    updatedAt: row.updated_at,
    url: row.url,
});

export const sqliteMetadataAdapter = (
    options: SqliteMetadataAdapterOptions
): MetadataAdapter => {
    const database = new Database(options.dbPath);
    database.exec(CREATE_TABLE_SQL);

    const getStatement = database.prepare(
        `SELECT id, asset_key, url, mime_type, updated_at FROM editable_assets WHERE id = ?`
    );
    const setStatement = database.prepare(
        `
        INSERT INTO editable_assets (id, asset_key, url, mime_type, updated_at)
        VALUES (@id, @assetKey, @url, @mimeType, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
            asset_key = excluded.asset_key,
            url = excluded.url,
            mime_type = excluded.mime_type,
            updated_at = excluded.updated_at
        `
    );
    const removeStatement = database.prepare(
        `DELETE FROM editable_assets WHERE id = ?`
    );

    return {
        get(id: string): Promise<AssetRecord | null> {
            const row = getStatement.get(id) as AssetRow | undefined;
            return Promise.resolve(row ? toAssetRecord(row) : null);
        },

        remove(id: string): Promise<void> {
            removeStatement.run(id);
            return Promise.resolve();
        },

        set(id: string, record: AssetRecord): Promise<void> {
            setStatement.run({
                assetKey: record.assetKey,
                id,
                mimeType: record.mimeType,
                updatedAt: record.updatedAt,
                url: record.url,
            });
            return Promise.resolve();
        },
    };
};
