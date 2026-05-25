import type { IAssetRecord, IMetadataAdapterFactory } from "@raurus/core";
import Database from "better-sqlite3";
import { toAssetRecord } from "packages/metadata-sqlite/src/util";

import type { AssetRow, SqliteMetadataAdapterOptions } from "./types";

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS editable_assets (
  id TEXT PRIMARY KEY,
  asset_key TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

const GET_ASSET_SQL = `
    SELECT id, asset_key, url, mime_type, updated_at FROM editable_assets WHERE id = ?
`;
const SET_ASSET_SQL = `
    INSERT INTO editable_assets (id, asset_key, url, mime_type, updated_at)
    VALUES (@id, @assetKey, @url, @mimeType, @updatedAt)
    ON CONFLICT(id) DO UPDATE SET
        asset_key = excluded.asset_key,
        url = excluded.url,
        mime_type = excluded.mime_type,
        updated_at = excluded.updated_at
`;
const REMOVE_ASSET_SQL = `DELETE FROM editable_assets WHERE id = ?`;

export const sqliteMetadataAdapter: IMetadataAdapterFactory<
    SqliteMetadataAdapterOptions
> = (options) => {
    const database = new Database(options.dbPath);
    database.exec(CREATE_TABLE_SQL);

    const getStatement = database.prepare(GET_ASSET_SQL);
    const setStatement = database.prepare(SET_ASSET_SQL);
    const removeStatement = database.prepare(REMOVE_ASSET_SQL);

    return {
        get(id: string): Promise<IAssetRecord | null> {
            const row = getStatement.get(id) as AssetRow | undefined;
            if (!row) {
                return Promise.resolve(null);
            }

            return Promise.resolve(toAssetRecord(row));
        },

        remove(id: string): Promise<void> {
            removeStatement.run(id);
            return Promise.resolve();
        },

        set(id: string, record: IAssetRecord): Promise<void> {
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
