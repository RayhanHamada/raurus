import { openapi } from "@elysia/openapi";
import type { RuntimeMetadataAdapter, RuntimeStorageAdapter } from "@raurus/core";
import { Elysia } from "elysia";

import { routes } from "./routes";

/**
 * Options for creating a Raurus runtime instance. This interface defines the configuration options that can be passed to the `createRuntime` function when setting up a Raurus server. It includes properties for specifying the metadata adapter, storage adapter, API origin, base path, and whether to enable OpenAPI documentation. The `metadataAdapter` and `storageAdapter` are required for the runtime to function properly, while the `origin`, `basePath`, and `openapi` options have default values if not provided.
 */
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

const DEFAULT_RUNTIME_OPTIONS = {
    basePath: "/_raurus",
    openapi: true,
} satisfies Partial<CreateRuntimeOptions>;

/**
 * Creates a runtime instance for handling API requests related to metadata and asset management. The function takes a configuration object as input, which can include options such as the base URL for the API. It sets up an Elysia application with OpenAPI documentation and defines the routes for handling incoming requests. The resulting runtime instance provides a fetch method that can be used to process API requests according to the defined routes and configuration.
 *
 * @param config The configuration object for creating the runtime instance, which can include options such as the base URL for the API.
 * @returns An object containing the fetch method for handling API requests.
 */
export function createRuntime<Options extends CreateRuntimeOptions>(config: Options) {
    const options = { ...DEFAULT_RUNTIME_OPTIONS, ...config };

    const url = new URL(options.origin);
    const fullUrl = new URL(options.basePath, url);

    const app = new Elysia()
        .use(
            openapi({
                enabled: options.openapi,
                documentation: {
                    openapi: "3.1.1",
                    servers: [{ url: fullUrl.href }],
                    info: {
                        title: "Raurus OpenAPI",
                        version: "1.0.0",
                        description: "This is the OpenAPI specification for the Raurus server.",
                        license: { name: "MIT" },
                    },
                },
            })
        )

        .group(options.basePath, (groupApp) =>
            groupApp.use(
                routes({
                    metadata: options.metadataAdapter,
                    storage: options.storageAdapter,
                })
            )
        );

    return { fetch: app.handle };
}
