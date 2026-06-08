import type { RaurusMetadataAdapter, RaurusStorageAdapter } from "@raurus/core";

export interface CreateRuntimeOptions {
    /**
     * The metadata adapter to use for the Raurus instance. This is required.
     */
    metadataAdapter: RaurusMetadataAdapter;

    /**
     * The storage adapter to use for the Raurus instance. This is required.
     */
    storageAdapter: RaurusStorageAdapter;

    /**
     * default to "/api", the base path for all API endpoints. You can change this if you want to serve the API under a different path.
     */
    basePath?: string;

    /**
     * default to "/docs", the path to serve the Swagger UI documentation. You can change this if you want to serve the documentation under a different path.
     */
    docsPath?: string;
}
