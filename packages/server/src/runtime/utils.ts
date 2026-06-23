import { openapi } from "@elysia/openapi";
import type { RuntimeAuthAdapter, RuntimeDatabaseAdapter, RuntimeStorageAdapter } from "@raurus/core";
import { getLogger } from "@raurus/logger";
import { Elysia } from "elysia";

import { routes } from "./routes";

const log = getLogger("server");

/**
 * Options for creating a Raurus runtime instance. The `metadataAdapter`, `storageAdapter`, and `authAdapter` are optional; routes guard missing adapters and return 501 where appropriate. The `openapi` option defaults to true if not provided.
 */
export interface CreateRuntimeOptions {
    /**
     * base URL + base path for the API. Required.
     */
    baseUrl: string | URL;

    /**
     * The metadata adapter to use for the Raurus instance.
     */
    metadataAdapter?: RuntimeDatabaseAdapter | undefined;

    /**
     * The storage adapter to use for the Raurus instance.
     */
    storageAdapter?: RuntimeStorageAdapter | undefined;

    /**
     * The auth adapter to use for the Raurus instance.
     */
    authAdapter?: RuntimeAuthAdapter | undefined;

    /**
     * Whether to enable OpenAPI documentation. This is optional and defaults to `true`.
     *
     * @default true
     */
    openapi?: boolean;
}

const DEFAULT_RUNTIME_OPTIONS = {
    openapi: true,
} satisfies Partial<CreateRuntimeOptions>;

/**
 * Creates a runtime instance for handling API requests related to metadata and asset management. The function takes a configuration object as input, which can include options such as the base URL for the API. It sets up an Elysia application with OpenAPI documentation and defines the routes for handling incoming requests. The resulting runtime instance provides a fetch method that can be used to process API requests according to the defined routes and configuration.
 *
 * @param config The configuration object for creating the runtime instance, which can include options such as the base URL for the API.
 * @returns An object containing the fetch method for handling API requests.
 */
export function createRuntime(config: CreateRuntimeOptions) {
    const options = { ...DEFAULT_RUNTIME_OPTIONS, ...config };

    log.debug("Creating Raurus runtime", { baseUrl: options.baseUrl.toString(), openapi: options.openapi });

    const url = URL.parse(options.baseUrl);
    if (!url) {
        log.error("Invalid baseUrl provided", { baseUrl: options.baseUrl.toString() });
        throw new Error(`Invalid baseUrl: ${options.baseUrl}`);
    }

    const basePath = url.pathname === "/" ? "_raurus" : url.pathname;

    log.info("Raurus runtime initialized", { basePath, origin: url.origin, openapi: options.openapi });

    const app = new Elysia({
        prefix: basePath,
    })

        .use(
            openapi({
                enabled: options.openapi,
                documentation: {
                    openapi: "3.1.1",
                    servers: [{ url: url.origin }],
                    info: {
                        title: "Raurus OpenAPI",
                        version: "1.0.0",
                        description: "This is the OpenAPI specification for the Raurus server.",
                        license: { name: "MIT" },
                    },
                },
            })
        )

        .use(
            routes({
                metadata: options.metadataAdapter,
                storage: options.storageAdapter,
                auth: options.authAdapter,
            })
        );

    return { fetch: app.handle };
}
