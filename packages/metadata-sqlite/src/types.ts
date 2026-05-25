import type { IMetadataAdapterFactoryBaseOptions } from "@raurus/core";

export interface SqliteMetadataAdapterOptions extends IMetadataAdapterFactoryBaseOptions {
    dbPath: string;
}

export interface AssetRow {
    asset_key: string;
    id: string;
    mime_type: string;
    updated_at: string;
    url: string;
}
