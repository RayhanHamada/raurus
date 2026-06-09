export interface RaurusMetadata {
    placeholderId: string;
    assetKey: string;
}

export type RaurusAsset = ArrayBuffer | File | Blob;

export interface RaurusMetadataAdapterBaseConfig {}
export interface RaurusStorageAdapterBaseConfig {}

export interface RaurusMetadataAdapter {
    /**
     * Retrieves metadata associated with a given placeholder ID. If no metadata is found for the provided placeholder ID, the method returns null.
     *
     * @param placeholderId The placeholder ID for which to retrieve metadata.
     * @returns A promise that resolves to the retrieved metadata as a RaurusMetadata object, or null if no metadata is found for the provided placeholder ID.
     */
    getMetadataById(placeholderId: RaurusMetadata["placeholderId"]): Promise<RaurusMetadata | null>;

    /**
     * Inserts metadata for a given placeholder ID and asset key.
     *
     * @param placeholderId The placeholder ID for which to insert metadata.
     * @param assetKey The asset key associated with the placeholder ID.
     * @returns A promise that resolves when the metadata has been successfully inserted.
     */
    insertMetadata(placeholderId: RaurusMetadata["placeholderId"], assetKey: RaurusMetadata["assetKey"]): Promise<void>;
}
export interface RaurusStorageAdapter {
    /**
     * Uploads an asset to the storage service using its asset key. The asset data can be provided as an ArrayBuffer, File, or Blob.
     *
     * @param assetKey The asset key under which the asset will be stored.
     * @param data The asset data to be uploaded, which can be an ArrayBuffer, File, or Blob.
     * @returns A promise that resolves when the asset has been successfully uploaded.
     */
    uploadAsset(assetKey: RaurusMetadata["assetKey"], data: RaurusAsset): Promise<void>;

    /**
     * Generates a presigned URL for uploading an asset directly to the storage service.
     *
     * @param assetKey The asset key for which to generate the presigned upload URL.
     * @param expiresIn Optional expiration time in seconds for the presigned URL. If not provided, a default expiration time will be used.
     * @returns A promise that resolves to the generated presigned upload URL as a string.
     */
    createPresignedUploadUrl(assetKey: RaurusMetadata["assetKey"], expiresIn?: number): Promise<string>;

    /**
     * Generates a presigned URL for downloading an asset directly from the storage service.
     *
     * @param assetKey The asset key for which to generate the presigned download URL.
     * @param expiresIn Optional expiration time in seconds for the presigned URL. If not provided, a default expiration time will be used.
     * @returns A promise that resolves to the generated presigned download URL as a string.
     */
    createPresignedDownloadUrl(assetKey: RaurusMetadata["assetKey"], expiresIn?: number): Promise<string>;

    /**
     * Deletes an asset from the storage service using its asset key.
     *
     * @param assetKey The asset key of the asset to be deleted.
     * @returns A promise that resolves when the asset has been successfully deleted.
     */
    deleteAsset(assetKey: RaurusMetadata["assetKey"]): Promise<void>;
}

export type RaurusMetadataAdapterFactory = (config: RaurusMetadataAdapterBaseConfig) => RaurusMetadataAdapter;
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
