import type { RaurusMetadataAdapter, RaurusStorageAdapter } from "@raurus/core";

export interface CreateRaurusOptions {
    /**
     * The metadata adapter to use for the Raurus instance. This is required.
     */
    metadataAdapter: RaurusMetadataAdapter;

    /**
     * The storage adapter to use for the Raurus instance. This is required.
     */
    storageAdapter: RaurusStorageAdapter;

    /**
     * The base URL for the API endpoints. This base url can includes `base path`. For example, if your API is served at https://example.com/api, then the base URL should be https://example.com. This is used to generate the OpenAPI specification and the Swagger UI documentation. If not provided, it will default to the origin of the request.
     */
    baseUrl: string;

    /**
     * default to "/docs", the path to serve the Swagger UI documentation. You can change this if you want to serve the documentation under a different path.
     */
    docsPath?: `/${string}`;

    /**
     * default to "/openapi.json", the path to serve the OpenAPI specification. You can change this if you want to serve the specification under a different path.
     */
    specPath?: `/${string}.json`;
}
