import type { RuntimeDatabaseAdapter, RuntimeStorageAdapter } from "@raurus/core";
import { Elysia } from "elysia";

import { initializeLogger, log } from "@/runtime/utils";

import { routes } from "./routes";

/**
 * Options for creating a Raurus runtime instance. The `databaseAdapter` and `storageAdapter` are optional; routes guard missing adapters and return 501 where appropriate. The `openapi` option defaults to true if not provided.
 */
export interface CreateRuntimeOptions {
    /**
     * base URL + base path for the API. Required.
     */
    baseUrl: string | URL;

    /**
     * The database adapter to use for the Raurus instance.
     */
    databaseAdapter: RuntimeDatabaseAdapter;

    /**
     * The storage adapter to use for the Raurus instance.
     */
    storageAdapter: RuntimeStorageAdapter;

    /**
     * Whether to enable debug logging. This is optional and defaults to `false`.
     *
     * @default false
     */
    debug?: boolean;
}

const DEFAULT_RUNTIME_OPTIONS = {
    debug: false,
} satisfies Partial<CreateRuntimeOptions>;

/**
 * Creates a runtime instance for handling API requests related to metadata and asset management. The function takes a configuration object as input, which can include options such as the base URL for the API. It sets up an Elysia application with OpenAPI documentation and defines the routes for handling incoming requests. The resulting runtime instance provides a fetch method that can be used to process API requests according to the defined routes and configuration.
 *
 * @param config The configuration object for creating the runtime instance, which can include options such as the base URL for the API.
 * @returns An object containing the fetch method for handling API requests.
 */
export function createRuntime(config: CreateRuntimeOptions) {
    const options = { ...DEFAULT_RUNTIME_OPTIONS, ...config };

    if (options.debug) {
        initializeLogger();
    }

    const url = URL.parse(options.baseUrl);
    if (!url) {
        const baseUrl = options.baseUrl.toString();
        log.error("Invalid baseUrl provided", { baseUrl });
        throw new Error(`Invalid baseUrl: ${baseUrl}`);
    }

    const prefix = url.pathname === "/" ? "_raurus" : url.pathname;

    log.info("Raurus runtime initialized", { basePath: prefix, origin: url.origin });

    const app = new Elysia({ prefix })

        .use(
            routes({
                databaseAdapter: options.databaseAdapter,
                storageAdapter: options.storageAdapter,
            })
        );

    return { fetch: app.handle };
}
