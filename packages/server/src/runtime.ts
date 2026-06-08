import { getJsAsset, renderApiReference } from "@scalar/server-side-rendering";
import { createRouter } from "itty-spec";

import { DEFAULT_RUNTIME_OPTIONS, OPENAPI_CONFIG } from "./config";
import { contract } from "./contract";
import type { CreateRuntimeOptions } from "./types";

type TRouter = ReturnType<typeof createRouter>;

let cachedRouter: TRouter | null = null;

export function createRuntime<Options extends CreateRuntimeOptions>(config?: Options) {
    const options = {
        ...DEFAULT_RUNTIME_OPTIONS,
        ...config,
    };

    cachedRouter ??= createRouter({
        contract,
        base: options.basePath,
        handlers: {
            async getSpec(request) {
                const { default: openapi } = await import("../openapi.json");

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
        .get("/docs", async () => {
            const { default: content } = await import("../openapi.json");

            const html = await renderApiReference({
                pageTitle: OPENAPI_CONFIG.title,
                cdn: `${options.basePath || ""}/scalar/scalar.js`,
                config: {
                    content,
                    theme: "saturn",
                },
            });

            return new Response(html, {
                headers: {
                    "Content-Type": "text/html",
                },
            });
        })

        .get(
            "/scalar/scalar.js",
            async () =>
                new Response(getJsAsset(), {
                    headers: {
                        "Content-Type": "application/javascript",
                    },
                })
        );

    return {
        fetch: cachedRouter.fetch as typeof fetch,
    };
}
