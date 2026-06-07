import { createContract } from "itty-spec";
import * as v from "valibot";

export const contract = createContract({
    /**
     * for getting openapi specification
     */
    getSpec: {
        method: "GET",
        path: "/openapi.json",
        title: "Get OpenAPI specification",
        description: "Endpoint to retrieve the OpenAPI specification for the Raurus server.",
        summary: "Get OpenAPI specification",
        tags: ["OpenAPI"],
        responses: {
            200: {
                "application/json": {
                    body: v.any(),
                },
            },
            400: {
                "application/json": {
                    body: v.object({}),
                },
            },
        },
    },

    /**
     * for getting a presigned URL for uploading an asset
     */
    getPresignedUrl: {
        method: "GET",
        path: "/presigned-url",
        title: "Get Presigned URL",
        description: "Endpoint to retrieve a presigned URL for uploading an asset.",
        summary: "Get Presigned URL",
        tags: ["Operations"],
        query: v.object({
            assetKey: v.pipe(v.string(), v.nonEmpty(), v.trim()),
        }),
        responses: {
            200: {
                "application/json": {
                    body: v.object({
                        message: v.literal("OK"),
                    }),
                },
            },
            400: {
                "application/json": {
                    body: v.object({
                        message: v.literal("Bad Request"),
                        error: v.string(),
                    }),
                },
            },
        },
    },
} as const);
