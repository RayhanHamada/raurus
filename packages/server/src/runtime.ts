import { openapi } from "@elysia/openapi";
import { Elysia } from "elysia";

import { DEFAULT_RUNTIME_OPTIONS, OPENAPI_CONFIG } from "@/config";

import { routes } from "./routes";
import type { CreateRaurusOptions } from "./types";

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
        .group(basePath, (groupApp) => groupApp.use(routes));

    return { fetch: app.handle };
}
