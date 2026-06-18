// oxlint-disable typescript/unified-signatures

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

export type FailureCode =
    | "NOT_IMPLEMENTED"
    | "NOT_FOUND"
    | "CONFLICT"
    | "CONFIGURATION"
    | "CONNECTION"
    | "PERMISSION"
    | "RATE_LIMIT"
    | "UPSTREAM"
    | "INVALID_INPUT"
    | "UNKNOWN";

export type RaurusAsset = ArrayBuffer;

export type PhotoMetadataType = "photo";
export type TextMetadataType = "text";
export type VideoMetadataType = "video";

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

export interface RuntimeMetadataAdapterBaseConfig {}

export interface RuntimeStorageAdapterBaseConfig {}

export interface RuntimeAuthAdapterBaseConfig {}

export interface CommonRuntimeAdapter {
    apiVersion: "1";
    checkConnection: () => Promise<AdapterMethodResult<null>>;
}

export interface RuntimeMetadataAdapter extends CommonRuntimeAdapter {
    id: `${Lowercase<string>}-metadata-adapter`;

    getMetadataByPlaceholderId: (placeholderId: string) => Promise<AdapterMethodResult<RaurusMetadata | null>>;

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
    id: `${Lowercase<string>}-storage-adapter`;

    uploadAsset?: (assetKey: string, asset: RaurusAsset) => Promise<AdapterMethodResult<{ assetKey: string }>>;

    createPresignedUploadUrl?: (assetKey: string, expiresIn?: number) => Promise<AdapterMethodResult<{ url: string }>>;

    createPresignedDownloadUrl?: (
        assetKey: string,
        expiresIn?: number
    ) => Promise<AdapterMethodResult<{ url: string }>>;

    deleteAsset?: (assetKey: string) => Promise<AdapterMethodResult<null>>;

    getAssetContent?: (assetKey: string) => Promise<AdapterMethodResult<{ data: ArrayBuffer; contentType: string }>>;
}

export interface RuntimeAuthAdapter extends CommonRuntimeAdapter {
    id: `${Lowercase<string>}-auth-adapter`;

    authenticate: (password: string) => Promise<AdapterMethodResult<{ token: string }>>;

    validateToken: (token: string) => Promise<AdapterMethodResult<{ valid: boolean }>>;
}

export type RaurusMetadataAdapterId = `${Lowercase<string>}-metadata-adapter`;
export type RaurusStorageAdapterId = `${Lowercase<string>}-storage-adapter`;
export type RaurusAuthAdapterId = `${Lowercase<string>}-auth-adapter`;

export type RuntimeMetadataAdapterFactory<
    Config extends RuntimeMetadataAdapterBaseConfig = RuntimeMetadataAdapterBaseConfig,
> = (config?: Config) => RuntimeMetadataAdapter;

export type RuntimeStorageAdapterFactory<
    Config extends RuntimeStorageAdapterBaseConfig = RuntimeStorageAdapterBaseConfig,
> = (config?: Config) => RuntimeStorageAdapter;

export type RuntimeAuthAdapterFactory<Config extends RuntimeAuthAdapterBaseConfig = RuntimeAuthAdapterBaseConfig> = (
    config?: Config
) => RuntimeAuthAdapter;
