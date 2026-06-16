import type { RuntimeMetadataAdapter, RuntimeStorageAdapter } from "@raurus/core";
import { Elysia } from "elysia";

import * as m from "./models";

interface RouteOptions {
    // Define any options needed for route generation here
    metadata: RuntimeMetadataAdapter;
    storage: RuntimeStorageAdapter;
}

export function routes(options: RouteOptions) {
    return new Elysia({ name: "raurus.routes" })
        .derive(() => ({
            opts: options,
        }))

        .get(
            "/",
            async (_) => ({
                status: "OK",
                message: "RAURUS_ENDPOINT",
            }),
            {
                detail: {
                    summary: "Health Check",
                    description:
                        "A simple endpoint to check if the Raurus Rest API is running. It can be used for monitoring and health checks.",
                    tags: ["Operations"],
                },
                response: {
                    200: m.HealthCheckResponseSchema,
                },
            }
        )

        .get(
            "/presigned-url",
            async ({ status, opts, query: { assetKey, expiresIn } }) => {
                if (!opts.storage.createPresignedUploadUrl) {
                    return status(400, {
                        message: "Error",
                        error: "Storage adapter does not support presigned URLs",
                    });
                }

                const result = await opts.storage.createPresignedUploadUrl(assetKey, expiresIn);

                if (!result.ok) {
                    return status(400, {
                        message: "Error",
                        error: "Failed to create presigned URL",
                    });
                }

                return status(200, {
                    message: "OK",
                    data: {
                        url: result.data.url,
                    },
                });
            },
            {
                detail: {
                    summary: "Get Presigned URL",
                    description:
                        "If implemented, this endpoint would generate a presigned URL for uploading an asset to a storage service.",
                    tags: ["Operations"],
                },
                query: m.PresignedUrlQuerySchema,
                response: {
                    200: m.PresignedUrlResponseSchema,
                    400: m.ErrorResponseSchema,
                },
            }
        )

        .post(
            "/upload-asset",
            async ({ status, opts }) => {
                if (!opts.storage?.createPresignedUploadUrl) {
                    return status(400, {
                        message: "Error",
                        error: "Storage adapter does not support direct asset upload",
                    });
                }

                return status(200, { message: "OK" });
            },
            {
                detail: {
                    summary: "Upload Asset",
                    description: "Endpoint to upload an asset using Raurus Rest API",
                    tags: ["Operations"],
                },
                body: m.UploadAssetBodySchema,
                response: {
                    200: m.UploadAssetResponseSchema,
                    400: m.ErrorResponseSchema,
                    401: m.ErrorResponseSchema,
                },
            }
        );
}
