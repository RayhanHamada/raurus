import type { IAssetRecord } from "@raurus/core";

import type { AssetRow } from "@/types";

export const toAssetRecord = (row: AssetRow): IAssetRecord => ({
    assetKey: row.asset_key,
    id: row.id,
    mimeType: row.mime_type,
    updatedAt: row.updated_at,
    url: row.url,
});
