import { createContract } from "itty-spec";
import * as v from "valibot";

import { OPENAPI_JSON_PATH } from "./config";

export const contract = createContract({
    /**
     * for getting openapi specification
     */
    getSpec: {
        method: "GET",
        path: OPENAPI_JSON_PATH,
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
                    body: v.object({
                        message: v.literal("Error"),
                        error: v.string(),
                    }),
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
        description:
            "If implemented, this endpoint would generate a presigned URL for uploading an asset to a storage service. The client would provide the asset key as a query parameter, and the server would return a presigned URL that the client can use to upload the asset directly to the storage service.",
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
                        message: v.literal("Error"),
                        error: v.string(),
                    }),
                },
            },
        },
    },

    uploadAsset: {
        method: "POST",
        path: "/upload-asset",
        title: "Upload Asset",
        description: "Endpoint to upload an asset using Raurus Rest API",
        summary: "Upload Asset",
        tags: ["Operations"],
        requests: {
            "application/json": {
                body: v.file(),
            },
        },
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
                        message: v.literal("Error"),
                        error: v.string(),
                    }),
                },
            },
        },
    },
} as const);
