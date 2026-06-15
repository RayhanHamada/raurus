export interface RaurusMetadata {
    placeholderId: string | number;
    assetKey: string;
}

export type RaurusAsset = ArrayBuffer | File | Blob;

export interface RuntimeMetadataAdapterBaseConfig {}
export interface RuntimeStorageAdapterBaseConfig {}

/**
 * Defines the interface for a metadata adapter that provides methods for retrieving and upserting metadata associated with placeholder IDs and asset keys. The adapter allows for interaction with a metadata storage system to manage the association between placeholder IDs and their corresponding asset keys.
 */
export interface RuntimeMetadataAdapter {
    /**
     * Retrieves metadata associated with a given placeholder ID. If no metadata is found for the provided placeholder ID, the method returns null.
     *
     * @param placeholderId The placeholder ID for which to retrieve metadata.
     * @returns A promise that resolves to the retrieved metadata as a RaurusMetadata object, or null if no metadata is found for the provided placeholder ID.
     */
    getMetadataById(placeholderId: RaurusMetadata["placeholderId"]): Promise<RaurusMetadata | null>;

    /**
     * Inserts or updates metadata for a given placeholder ID and asset key.
     *
     * @param placeholderId The placeholder ID for which to insert or update metadata.
     * @param assetKey The asset key associated with the placeholder ID.
     * @returns A promise that resolves when the metadata has been successfully inserted or updated.
     */
    upsertMetadata(placeholderId: RaurusMetadata["placeholderId"], assetKey: RaurusMetadata["assetKey"]): Promise<void>;
}

/**
 * Defines the interface for a storage adapter that provides methods for uploading, generating presigned URLs, and deleting assets in a storage service. The adapter allows for interaction with the storage service using asset keys and supports various data formats for asset uploads.
 */
export interface RuntimeStorageAdapter {
    /**
     * Generates a presigned URL for uploading an asset directly to the storage service.
     *
     * @param assetKey The asset key for which to generate the presigned upload URL.
     * @param expiresIn Optional expiration time in seconds for the presigned URL. If not provided, a default expiration time will be used.
     * @returns A promise that resolves to the generated presigned upload URL as a string.
     */
    createPresignedUploadUrl?(assetKey: RaurusMetadata["assetKey"], expiresIn?: number): Promise<string>;

    /**
     * Deletes an asset from the storage service using its asset key.
     *
     * @param assetKey The asset key of the asset to be deleted.
     * @returns A promise that resolves when the asset has been successfully deleted.
     */
    deleteAsset?(assetKey: RaurusMetadata["assetKey"]): Promise<void>;

    /**
     * Uploads an asset to the storage service using its asset key. The asset data can be provided as an ArrayBuffer, File, or Blob.
     *
     * @param assetKey The asset key under which the asset will be stored.
     * @param data The asset data to be uploaded, which can be an ArrayBuffer, File, or Blob.
     * @returns A promise that resolves when the asset has been successfully uploaded.
     */
    uploadAsset?(assetKey: RaurusMetadata["assetKey"], data: RaurusAsset): Promise<void>;
}

/**
 * Defines the factory type for creating instances of RuntimeMetadataAdapter and RuntimeStorageAdapter. The factories take a configuration object as input and return an instance of the respective adapter. The configuration objects can be extended to include specific settings required for the adapters, allowing for flexibility in their implementation and usage.
 */
export type RuntimeMetadataAdapterFactory<
    Config extends RuntimeMetadataAdapterBaseConfig = RuntimeMetadataAdapterBaseConfig,
> = (config?: Config) => RuntimeMetadataAdapter;

/**
 * Defines the factory type for creating instances of RuntimeStorageAdapter. The factory takes a configuration object as input and returns an instance of RuntimeStorageAdapter. The configuration object can be extended to include specific settings required for the storage adapter, allowing for flexibility in its implementation and usage.
 */
export type RuntimeStorageAdapterFactory<
    Config extends RuntimeStorageAdapterBaseConfig = RuntimeStorageAdapterBaseConfig,
> = (config?: Config) => RuntimeStorageAdapter;
