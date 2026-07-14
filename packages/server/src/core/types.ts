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

export type AdapterAPIResult<T> = Success<T> | Failure;

export type PhotoMetadataType = typeof METADATA_TYPES.PHOTO;
export type TextMetadataType = typeof METADATA_TYPES.TEXT;
export type VideoMetadataType = typeof METADATA_TYPES.VIDEO;

export type RaurusMetadataType = PhotoMetadataType | TextMetadataType | VideoMetadataType;

export type RaurusMetadata = {
    placeholderId: string;
} & (
    | {
          type: PhotoMetadataType | VideoMetadataType;
          assetKey: string;
      }
    | {
          type: TextMetadataType;
          text: string;
      }
);

export interface RuntimeDatabaseAdapterBaseConfig {}

export interface RuntimeStorageAdapterBaseConfig {}

export interface CommonRuntimeAdapter {
    apiVersion: "1";
    checkConnection: () => Promise<AdapterAPIResult<null>>;
}

export type RaurusDatabaseAdapterId = `${Lowercase<string>}-database-adapter`;
export type RaurusStorageAdapterId = `${Lowercase<string>}-storage-adapter`;

export interface RuntimeDatabaseAdapter extends CommonRuntimeAdapter {
    id: RaurusDatabaseAdapterId;

    upsertContentMetadata: (
        placeholderId: string,
        path: string,
        payload:
            | {
                  type: PhotoMetadataType | VideoMetadataType;
                  assetKey: string;
              }
            | {
                  type: TextMetadataType;
                  text: string;
              }
    ) => Promise<AdapterAPIResult<null>>;

    listContentMetadataByPath: (path: string) => Promise<AdapterAPIResult<RaurusMetadata[]>>;
}

export interface RuntimeStorageAdapter extends CommonRuntimeAdapter {
    id: RaurusStorageAdapterId;

    createPresignedUploadUrl?: (assetKey: string) => Promise<AdapterAPIResult<{ url: string; headers?: Headers }>>;

    deleteAsset?: (assetKey: string) => Promise<AdapterAPIResult<null>>;
}

export type RuntimeDatabaseAdapterFactory<
    Config extends RuntimeDatabaseAdapterBaseConfig = RuntimeDatabaseAdapterBaseConfig,
> = (config?: Config) => RuntimeDatabaseAdapter;

export type RuntimeStorageAdapterFactory<
    Config extends RuntimeStorageAdapterBaseConfig = RuntimeStorageAdapterBaseConfig,
> = (config?: Config) => RuntimeStorageAdapter;
