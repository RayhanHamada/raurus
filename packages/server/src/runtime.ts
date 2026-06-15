import { openapi } from "@elysia/openapi";
import { Elysia } from "elysia";

import { DEFAULT_RUNTIME_OPTIONS, OPENAPI_CONFIG } from "@/config";

import { getRoutes } from "./routes";
import type { CreateRaurusOptions } from "./types";

/**
 * Creates a runtime instance for handling API requests related to metadata and asset management. The function takes a configuration object as input, which can include options such as the base URL for the API. It sets up an Elysia application with OpenAPI documentation and defines the routes for handling incoming requests. The resulting runtime instance provides a fetch method that can be used to process API requests according to the defined routes and configuration.
 *
 * @param config The configuration object for creating the runtime instance, which can include options such as the base URL for the API.
 * @returns An object containing the fetch method for handling API requests.
 */
export function createRuntime<Options extends CreateRaurusOptions>(config: Options) {
    const options = { ...DEFAULT_RUNTIME_OPTIONS, ...config };

    const url = new URL(options.baseUrl);
    const { origin } = url;
    const basePath = url.pathname;

    const app = new Elysia()
        .use(
            openapi({
                documentation: {
                    info: OPENAPI_CONFIG.info,
                    servers: [{ url: origin }],
                },
            })
        )

        .group(basePath, (groupApp) =>
            groupApp.use(
                getRoutes({
                    metadata: options.metadataAdapter,
                    storage: options.storageAdapter,
                })
            )
        );

    return { fetch: app.handle };
}
