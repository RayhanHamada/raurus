export interface CreateRuntimeOptions {
    /**
     * default to "/api", the base path for all API endpoints. You can change this if you want to serve the API under a different path.
     */
    basePath?: string;

    /**
     * default to "/docs", the path to serve the Swagger UI documentation. You can change this if you want to serve the documentation under a different path.
     */
    docsPath?: string;
}
