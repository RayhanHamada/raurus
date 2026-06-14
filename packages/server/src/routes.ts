import type { RuntimeMetadataAdapter, RuntimeStorageAdapter } from "@raurus/core";
import { Elysia } from "elysia";

import { models } from "./models";

interface GetRoutesOptions {
    // Define any options needed for route generation here
    metadataAdapter: RuntimeMetadataAdapter;
    storageAdapter: RuntimeStorageAdapter;
}

export function getRoutes(options: GetRoutesOptions) {
    const routes = new Elysia({ name: "raurus.routes" })
        .use(models)

        .get(
            "/presigned-url",
            async (c) => {
                const { assetKey } = c.query;
                const url = await options.storageAdapter.createPresignedUploadUrl(assetKey);

                return {
                    message: "OK",
                    data: { url },
                };
            },
            {
                detail: {
                    summary: "Get Presigned URL",
                    description:
                        "If implemented, this endpoint would generate a presigned URL for uploading an asset to a storage service.",
                    tags: ["Operations"],
                },
                query: "PresignedUrlQuery",
                response: {
                    200: "PresignedUrlResponse",
                    400: "ErrorResponse",
                },
            }
        )

        .post("/upload-asset", async (_c) => ({ message: "OK" }), {
            detail: {
                summary: "Upload Asset",
                description: "Endpoint to upload an asset using Raurus Rest API",
                tags: ["Operations"],
            },
            body: "UploadAssetBody",
            response: {
                200: "UploadAssetResponse",
                400: "ErrorResponse",
            },
        });

    return routes;
}
