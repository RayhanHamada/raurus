export interface RaurusMetadataAdapterBaseConfig {}
export interface RaurusMetadataAdapter {
    getMetadata(assetId: string): Promise<Record<string, unknown>>;
}
export type RaurusMetadataAdapterFactory = (config: RaurusMetadataAdapterBaseConfig) => RaurusMetadataAdapter;

export interface RaurusStorageAdapterBaseConfig {}
export interface RaurusStorageAdapter {}
export type RaurusStorageAdapterFactory = (config: RaurusStorageAdapterBaseConfig) => RaurusStorageAdapter;

export interface RaurusInstanceConfig<
    TMetadataAdapter extends RaurusMetadataAdapter = RaurusMetadataAdapter,
    TStorageAdapter extends RaurusStorageAdapter = RaurusStorageAdapter,
> {
    metadata: TMetadataAdapter;
    storage: TStorageAdapter;
}

export interface RaurusInstance {}

export type RaurusFactory = (config: RaurusInstanceConfig) => RaurusInstance;
