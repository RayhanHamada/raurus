import type { RuntimeMetadataAdapter, RuntimeStorageAdapter } from "@raurus/core";

export interface CreateRuntimeOptions {
    /**
     * The metadata adapter to use for the Raurus instance. This is required.
     */
    metadataAdapter: RuntimeMetadataAdapter;

    /**
     * The storage adapter to use for the Raurus instance. This is required.
     */
    storageAdapter: RuntimeStorageAdapter;

    /**
     * The origin for the Raurus API. This can be a string or a URL object.
     */
    origin: string | URL;

    /**
     * The base path for the API. This is optional and defaults to "/_raurus".
     */
    basePath?: string;

    /**
     * Whether to enable OpenAPI documentation. This is optional and defaults to `true`.
     */
    openapi?: boolean;
}
