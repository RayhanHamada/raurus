import { swaggerUI } from "@hono/swagger-ui";
import { createRouter } from "itty-spec";

import { defaultRuntimeOptions } from "./config";
import { contract } from "./contract";
import openapi from "./openapi.json" with { type: "json" };
import type { CreateRuntimeOptions } from "./types";

type TRouter = ReturnType<typeof createRouter>;

let cachedRouter: TRouter | null = null;

export function createRuntime<Options extends CreateRuntimeOptions>(config?: Options): TRouter {
    const options = {
        ...defaultRuntimeOptions,
        ...config,
    };

    cachedRouter ??= createRouter({
        contract,
        base: options.basePath,
        handlers: {
            async getSpec(request) {
                return request.respond({
                    contentType: "application/json",
                    status: 200,
                    body: JSON.stringify(openapi),
                });
            },

            async getPresignedUrl(request) {
                return request.respond({
                    contentType: "application/json",
                    status: 200,
                    body: { message: "OK" },
                });
            },

            async uploadAsset(request) {
                return request.respond({
                    contentType: "application/json",
                    status: 200,
                    body: { message: "OK" },
                });
            },
        },
    })
        /**
         * Serve Swagger UI at /docs endpoint
         */
        .get(options.docsPath, swaggerUI({ url: "/openapi.json" }));

    return cachedRouter;
}
