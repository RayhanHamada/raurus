// oxlint-disable typescript/unified-signatures
import type { FAILURE_CODES, METADATA_TYPES } from "./constants";

export type FailureCode = (typeof FAILURE_CODES)[keyof typeof FAILURE_CODES];

export interface Success<T> {
    ok: true;
    data: T;
}

export interface Failure {
    ok: false;
    error: Error;
    code?: FailureCode;
}

export type AdapterMethodResult<T> = Success<T> | Failure;

export type RaurusAsset = ArrayBuffer;

export type PhotoMetadataType = typeof METADATA_TYPES.PHOTO;
export type TextMetadataType = typeof METADATA_TYPES.TEXT;
export type VideoMetadataType = typeof METADATA_TYPES.VIDEO;

export type RaurusMetadataType = PhotoMetadataType | TextMetadataType | VideoMetadataType;

export type RaurusMetadata = {
    placeholderId: string;
} & (
    | {
          type: PhotoMetadataType;
          assetKey: string;
      }
    | {
          type: TextMetadataType;
          text: string;
      }
    | {
          type: VideoMetadataType;
          assetKey: string;
      }
);

export interface RuntimeDatabaseAdapterBaseConfig {}

export interface RuntimeStorageAdapterBaseConfig {}

export interface CommonRuntimeAdapter {
    apiVersion: "1";
    checkConnection: () => Promise<AdapterMethodResult<null>>;
}

export type RaurusDatabaseAdapterId = `${Lowercase<string>}-database-adapter`;
export type RaurusStorageAdapterId = `${Lowercase<string>}-storage-adapter`;

export interface RuntimeDatabaseAdapter extends CommonRuntimeAdapter {
    id: RaurusDatabaseAdapterId;

    getMetadata: (placeholderId: string) => Promise<AdapterMethodResult<RaurusMetadata | null>>;

    bulkGetMetadataByPlaceholderIds: (placeholderIds: string[]) => Promise<AdapterMethodResult<RaurusMetadata[]>>;

    upsertContentMetadata: {
        (
            placeholderId: string,
            type: PhotoMetadataType | VideoMetadataType,
            assetKey: string
        ): Promise<AdapterMethodResult<null>>;
        (placeholderId: string, type: TextMetadataType, text: string): Promise<AdapterMethodResult<null>>;
    };
}

export interface RuntimeStorageAdapter extends CommonRuntimeAdapter {
    id: RaurusStorageAdapterId;

    uploadAsset?: (assetKey: string, asset: RaurusAsset) => Promise<AdapterMethodResult<{ assetKey: string }>>;

    createPresignedUploadUrl?: (assetKey: string, expiresIn?: number) => Promise<AdapterMethodResult<{ url: string }>>;

    createPresignedDownloadUrl?: (
        assetKey: string,
        expiresIn?: number
    ) => Promise<AdapterMethodResult<{ url: string }>>;

    deleteAsset?: (assetKey: string) => Promise<AdapterMethodResult<null>>;

    getAssetContent?: (assetKey: string) => Promise<AdapterMethodResult<{ data: ArrayBuffer; contentType: string }>>;
}

export type RuntimeDatabaseAdapterFactory<
    Config extends RuntimeDatabaseAdapterBaseConfig = RuntimeDatabaseAdapterBaseConfig,
> = (config?: Config) => RuntimeDatabaseAdapter;

export type RuntimeStorageAdapterFactory<
    Config extends RuntimeStorageAdapterBaseConfig = RuntimeStorageAdapterBaseConfig,
> = (config?: Config) => RuntimeStorageAdapter;

