// oxlint-disable no-unused-vars

export interface RaurusMetadataAdapterConfig {}
export interface RaurusMetadataAdapter {}
export type RaurusMetadataAdapterFactory = (config: RaurusMetadataAdapterConfig) => RaurusMetadataAdapter;

export interface RaurusStorageAdapterConfig {}
export interface RaurusStorageAdapter {}
export type RaurusStorageAdapterFactory = (config: RaurusStorageAdapterConfig) => RaurusStorageAdapter;

export interface RaurusInstanceConfig<
    TMetadataAdapter extends RaurusMetadataAdapter = RaurusMetadataAdapter,
    TStorageAdapter extends RaurusStorageAdapter = RaurusStorageAdapter,
> {
    metadata: TMetadataAdapter;
    storage: TStorageAdapter;
}

export interface RaurusInstance {}

export type RaurusFactory = (config: RaurusInstanceConfig) => RaurusInstance;
