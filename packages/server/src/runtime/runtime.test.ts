import { describe, expect, it } from "vitest";

import { createRuntime } from "./runtime";

describe(createRuntime, () => {
    it("creates a fetch-compatible runtime", async () => {
        const runtime = createRuntime({
            baseUrl: "http://localhost:3000",
            openapi: false,
        });

        const response = await runtime.fetch(new Request("http://localhost:3000/_raurus/"));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toStrictEqual({
            status: "OK",
            message: "RAURUS_ENDPOINT",
        });
    });
});
