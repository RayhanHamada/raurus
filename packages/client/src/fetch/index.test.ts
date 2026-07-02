import type { HeadersOptions } from "openapi-fetch";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { createApiClient } from "@/fetch";

const getLastRequest = (fetchMock: ReturnType<typeof vi.fn>): Request => {
    const arg = fetchMock.mock.calls[0]?.[0];
    if (arg instanceof Request) {
        return arg;
    }
    throw new Error("expected openapi-fetch to call fetch with a Request instance");
};

describe(createApiClient, () => {
    beforeEach(() => {
        vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("forwards baseUrl to openapi-fetch", async () => {
        const fetchMock = vi
            .mocked(globalThis.fetch)
            .mockResolvedValue(Response.json({ status: "OK", message: "RAURUS_ENDPOINT" }));

        const client = createApiClient({ baseUrl: "https://api.example.com" });
        const { data, error } = await client.GET("/_raurus/");

        expect(error).toBeUndefined();
        expect(data).toStrictEqual({ status: "OK", message: "RAURUS_ENDPOINT" });

        const request = getLastRequest(fetchMock);
        const url = new URL(request.url);
        expect(url.origin).toBe("https://api.example.com");
        expect(url.pathname).toBe("/_raurus/");
        expect(request.method).toBe("GET");
    });

    it("uses no custom headers when none are provided", async () => {
        const fetchMock = vi
            .mocked(globalThis.fetch)
            .mockResolvedValue(Response.json({ status: "OK", message: "RAURUS_ENDPOINT" }));

        const client = createApiClient({ baseUrl: "https://api.example.com" });
        await client.GET("/_raurus/");

        const request = getLastRequest(fetchMock);
        const headers = Object.fromEntries(request.headers.entries());
        expect(headers).not.toHaveProperty("authorization");
        expect(headers).not.toHaveProperty("x-custom");
    });

    it("forwards custom headers on every request", async () => {
        const fetchMock = vi
            .mocked(globalThis.fetch)
            .mockResolvedValue(Response.json({ status: "OK", message: "RAURUS_ENDPOINT" }));

        const client = createApiClient({
            baseUrl: "https://api.example.com",
            headers: { Authorization: "Bearer test-token", "X-Trace-Id": "abc-123" },
        });
        await client.GET("/_raurus/");

        const request = getLastRequest(fetchMock);
        expect(request.headers.get("authorization")).toBe("Bearer test-token");
        expect(request.headers.get("x-trace-id")).toBe("abc-123");
    });

    it("accepts a Headers instance as headers input", async () => {
        const fetchMock = vi
            .mocked(globalThis.fetch)
            .mockResolvedValue(Response.json({ status: "OK", message: "RAURUS_ENDPOINT" }));

        const headers = new Headers({ "X-Api-Key": "secret" });
        const client = createApiClient({ baseUrl: "https://api.example.com", headers });
        await client.GET("/_raurus/");

        const request = getLastRequest(fetchMock);
        expect(request.headers.get("x-api-key")).toBe("secret");
    });

    it("surfaces the error envelope when the server returns 4xx/5xx", async () => {
        vi.mocked(globalThis.fetch).mockResolvedValue(
            Response.json({ message: "Error", error: "Asset not found" }, { status: 400 })
        );

        const client = createApiClient({ baseUrl: "https://api.example.com" });
        const { data, error, response } = await client.GET("/_raurus/");

        expect(data).toBeUndefined();
        expect(response.status).toBe(400);
        expect(error).toBeDefined();
    });

    it("encodes path parameters into the request URL", async () => {
        const fetchMock = vi
            .mocked(globalThis.fetch)
            .mockResolvedValue(Response.json({ message: "Error", error: "Not implemented" }, { status: 501 }));

        const client = createApiClient({ baseUrl: "https://api.example.com" });
        await client.DELETE("/_raurus/asset/{asset_key}", {
            params: { path: { asset_key: "a key/with spaces" } },
        });

        const request = getLastRequest(fetchMock);
        const url = new URL(request.url);
        expect(url.origin).toBe("https://api.example.com");
        expect(url.pathname).toBe("/_raurus/asset/a%20key%2Fwith%20spaces");
        expect(request.method).toBe("DELETE");
    });

    it("returns independent client instances on each call", () => {
        const a = createApiClient({ baseUrl: "https://a.example.com" });
        const b = createApiClient({ baseUrl: "https://b.example.com" });
        expect(a).not.toBe(b);
    });
});

describe("Options", () => {
    it("treats headers as optional", () => {
        expectTypeOf<Parameters<typeof createApiClient>[0]["headers"]>().toEqualTypeOf<HeadersOptions | undefined>();
    });

    it("requires baseUrl", () => {
        expectTypeOf<Parameters<typeof createApiClient>[0]["baseUrl"]>().toEqualTypeOf<string>();
    });
});
