import { swaggerUI } from "@hono/swagger-ui";
import { createRouter } from "itty-spec";

import { contract } from "@/server/contract";
import openapi from "@/server/openapi.json" with { type: "json" };

function createRuntime() {
    const router = createRouter({
        contract,
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
        },
    });

    router.get("/docs", swaggerUI({ url: "/openapi.json" }));
}

export function raurus() {
    return createRuntime();
}
