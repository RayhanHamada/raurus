import { swaggerUI } from "@hono/swagger-ui";
import { createRouter } from "itty-spec";

import type { CreateRuntimeOptions } from "@/server";
import { defaultRuntimeOptions } from "@/server/config";
import { contract } from "@/server/contract";
import openapi from "@/server/openapi.json" with { type: "json" };

let cachedRouter: ReturnType<typeof createRouter> | null = null;

export function createRuntime<Options extends CreateRuntimeOptions>(config?: Options) {
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
