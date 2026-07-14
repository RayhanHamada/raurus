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
export type LinkMetadataType = typeof METADATA_TYPES.LINK;

export type RaurusMetadataType = PhotoMetadataType | TextMetadataType | LinkMetadataType;

export type RaurusMetadataPayload =
    | {
          type: PhotoMetadataType;
          assetKey: string;
      }
    | {
          type: TextMetadataType;
          text: string;
      }
    | {
          type: LinkMetadataType;
          link: string;
      };

export type RaurusMetadata = { placeholderId: string } & RaurusMetadataPayload;

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
        payload: RaurusMetadataPayload
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
