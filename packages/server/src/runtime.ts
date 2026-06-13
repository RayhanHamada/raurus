import { getJsAsset, renderApiReference } from "@scalar/server-side-rendering";
import { createOpenApiSpecification, createRouter } from "itty-spec";

import { DEFAULT_RUNTIME_OPTIONS, OPENAPI_CONFIG } from "@/config";
import { contract } from "@/contract";
import type { CreateRaurusOptions } from "@/types";

type TRouter = ReturnType<typeof createRouter>;

let cachedRouter: TRouter | null = null;

type BaseOptions = Partial<CreateRaurusOptions> & Pick<CreateRaurusOptions, "baseUrl">;

export function createRuntime<Options extends BaseOptions>(config: Options) {
    const options = {
        ...DEFAULT_RUNTIME_OPTIONS,
        ...config,
    };

    const basePath = new URL(options.baseUrl).pathname;

    cachedRouter ??= createRouter({
        contract,
        base: basePath,
        handlers: {
            async getPresignedUrl(request) {
                return request.respond({
                    contentType: "application/json",
                    status: 200,
                    body: {
                        message: "OK",
                        data: {
                            url: "https://example.com/presigned-url",
                        },
                    },
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
        .get(options.specPath, async () => {
            const spec = await createOpenApiSpecification(contract, { ...OPENAPI_CONFIG });
            return Response.json(spec);
        })
        .get(options.docsPath, async () => {
            const contentUrl = `${options.baseUrl}${options.specPath}`;
            const cdn = `${options.baseUrl}/scalar/scalar.js`;
            const pageTitle = OPENAPI_CONFIG.title;

            const html = await renderApiReference({
                cdn,
                pageTitle,
                config: { url: contentUrl },
            });

            return new Response(html, { headers: { "Content-Type": "text/html" } });
        })
        .get(
            "/scalar/scalar.js",
            async () => new Response(getJsAsset(), { headers: { "Content-Type": "application/javascript" } })
        );

    return {
        fetch: cachedRouter.fetch as typeof fetch,
    };
}
