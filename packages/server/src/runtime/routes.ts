import type { RuntimeMetadataAdapter, RuntimeStorageAdapter } from "@raurus/core";
import { Elysia } from "elysia";

import {
    ErrorResponseSchema,
    PresignedUrlQuerySchema,
    PresignedUrlResponseSchema,
    UploadAssetBodySchema,
    UploadAssetResponseSchema,
} from "./models";

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
            "/presigned-url",
            async ({ status, opts, query: { assetKey } }) => {
                if (!opts.storage.createPresignedUploadUrl) {
                    return status(400, {
                        message: "Error",
                        error: "Storage adapter does not support presigned URLs",
                    });
                }

                const url = await opts.storage.createPresignedUploadUrl(assetKey);

                return status(200, {
                    message: "OK",
                    data: { url },
                });
            },
            {
                detail: {
                    summary: "Get Presigned URL",
                    description:
                        "If implemented, this endpoint would generate a presigned URL for uploading an asset to a storage service.",
                    tags: ["Operations"],
                },
                query: PresignedUrlQuerySchema,
                response: {
                    200: PresignedUrlResponseSchema,
                    400: ErrorResponseSchema,
                },
            }
        )

        .post(
            "/upload-asset",
            async ({ status, opts }) => {
                if (!opts.storage?.uploadAsset) {
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
                body: UploadAssetBodySchema,
                response: {
                    200: UploadAssetResponseSchema,
                    400: ErrorResponseSchema,
                    401: ErrorResponseSchema,
                },
            }
        );
}
