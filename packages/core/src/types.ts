// oxlint-disable typescript/unified-signatures

export type PhotoMetadata = "photo";
export type TextMetadata = "text";
export type VideoMetadata = "video";

export type RaurusMetadataType = PhotoMetadata | TextMetadata | VideoMetadata;

export type RaurusMetadata = {
    placeholderId: string;
} & (
    | {
          type: PhotoMetadata;
          assetKey: string;
      }
    | {
          type: TextMetadata;
          text: string;
      }
    | {
          type: VideoMetadata;
          assetKey: string;
      }
);

export type RaurusAsset = ArrayBuffer | File | Blob;

/**
 * Defines the base configuration interface for runtime metadata adapters. This interface can be extended to include specific configuration options required for different metadata adapter implementations. It serves as a common structure for configuring metadata adapters, allowing for flexibility and consistency in their setup and usage across various implementations.
 */
export interface RuntimeMetadataAdapterBaseConfig {}

/**
 * Defines the base configuration interface for runtime storage adapters. This interface can be extended to include specific configuration options required for different storage adapter implementations. It serves as a common structure for configuring storage adapters, allowing for flexibility and consistency in their setup and usage across various implementations.
 */
export interface RuntimeStorageAdapterBaseConfig {}

/**
 * Defines the common interface for runtime adapters, which includes a method for checking the connection to the underlying service or database. This interface serves as a base for both metadata and storage adapters, ensuring that they implement a consistent method for verifying their connectivity and functionality.
 */
export interface CommonRuntimeAdapter {
    /**
     * Checks the connection to the underlying service or database used by the adapter. This method is intended to verify that the adapter can successfully connect to its required resources and is functioning correctly. The method returns a promise that resolves to an object containing an "ok" boolean property indicating the success of the connection check, and an optional "message" property providing additional information about the connection status.
     */
    checkConnection(): Promise<{ ok: boolean; message?: string }>;
}

/**
 * Defines the interface for a metadata adapter that provides methods for retrieving and upserting metadata associated with placeholder IDs and asset keys. The adapter allows for interaction with a metadata storage system to manage the association between placeholder IDs and their corresponding asset keys.
 */
export interface RuntimeMetadataAdapter extends CommonRuntimeAdapter {
    /**
     * Retrieves metadata associated with a given placeholder ID. If no metadata is found for the provided placeholder ID, the method returns null.
     *
     * @param placeholderId The placeholder ID for which to retrieve metadata.
     * @returns A promise that resolves to the retrieved metadata as a RaurusMetadata object, or null if no metadata is found for the provided placeholder ID.
     */
    getMetadataByPlaceholderId(placeholderId: string): Promise<RaurusMetadata | null>;

    /**
     * Retrieves metadata for multiple placeholder IDs in a single operation. This method allows for efficient retrieval of metadata associated with multiple placeholder IDs, reducing the number of individual calls needed to fetch metadata for each ID. The method takes an array of placeholder IDs as input and returns a promise that resolves to an array of RaurusMetadata objects corresponding to the provided placeholder IDs. If no metadata is found for a particular placeholder ID, it will not be included in the returned array.
     *
     * @param placeholderIds An array of placeholder IDs for which to retrieve metadata.
     * @returns A promise that resolves to an array of RaurusMetadata objects corresponding to the provided placeholder IDs. If no metadata is found for a particular placeholder ID, it will not be included in the returned array.
     */
    bulkGetMetadataByPlaceholderIds?(placeholderIds: string[]): Promise<RaurusMetadata[]>;

    /**
     * Upserts metadata for a given placeholder ID and asset key. This method allows for both inserting new metadata and updating existing metadata associated with a placeholder ID. The method takes a placeholder ID, a type indicating the kind of metadata (photo or video), and an asset key depending on the type of metadata being upserted. The method returns a promise that resolves when the upsert operation is complete.
     * @param placeholderId The placeholder ID for which to upsert metadata.
     * @param type The type of metadata being upserted, which can be "photo" or "video".
     * @param assetKey The asset key associated with the metadata, required for "photo" and "video" types.
     */
    upsertContentMetadata(placeholderId: string, type: PhotoMetadata | VideoMetadata, assetKey: string): Promise<void>;

    /**
     * Upserts text metadata for a given placeholder ID. This method is specifically designed for upserting text metadata, allowing for the insertion or updating of text content associated with a placeholder ID. The method takes a placeholder ID, a type indicating that the metadata is of type "text", and the text content to be upserted. The method returns a promise that resolves when the upsert operation is complete.
     * @param placeholderId The placeholder ID for which to upsert text metadata.
     * @param type The type of metadata being upserted, which must be "text" for this method.
     * @param text The text content associated with the metadata to be upserted.
     */
    upsertContentMetadata(placeholderId: string, type: TextMetadata, text: string): Promise<void>;
}

/**
 * Defines the interface for a storage adapter that provides methods for uploading, generating presigned URLs, and deleting assets in a storage service. The adapter allows for interaction with the storage service using asset keys and supports various data formats for asset uploads.
 */
export interface RuntimeStorageAdapter extends CommonRuntimeAdapter {
    /**
     * Generates a presigned URL for uploading an asset directly to the storage service.
     *
     * @param assetKey The asset key for which to generate the presigned upload URL.
     * @param expiresIn Optional expiration time in seconds for the presigned URL. If not provided, a default expiration time will be used.
     * @returns A promise that resolves to the generated presigned upload URL as a string.
     */
    createPresignedUploadUrl?(assetKey: string, expiresIn?: number): Promise<string>;
}

/**
 * Defines the factory type for creating instances of `RuntimeMetadataAdapter` and `RuntimeStorageAdapter`. The factories take a configuration object as input and return an instance of the respective adapter. The configuration objects can be extended to include specific settings required for the adapters, allowing for flexibility in their implementation and usage.
 */
export type RuntimeMetadataAdapterFactory<
    Config extends RuntimeMetadataAdapterBaseConfig = RuntimeMetadataAdapterBaseConfig,
> = (config?: Config) => RuntimeMetadataAdapter;

/**
 * Defines the factory type for creating instances of `RuntimeStorageAdapter`. The factory takes a configuration object as input and returns an instance of `RuntimeStorageAdapter`. The configuration object can be extended to include specific settings required for the storage adapter, allowing for flexibility in its implementation and usage.
 */
export type RuntimeStorageAdapterFactory<
    Config extends RuntimeStorageAdapterBaseConfig = RuntimeStorageAdapterBaseConfig,
> = (config?: Config) => RuntimeStorageAdapter;
