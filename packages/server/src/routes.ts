import { Elysia } from "elysia";

import { models } from "./models";

export const routes = new Elysia({ name: "raurus.routes" })
    .use(models)

    .get(
        "/presigned-url",
        async (c) => ({
            message: "OK",
            data: { url: `https://example.com/presigned-url?key=${c.query.assetKey}` },
        }),
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

    .post("/upload-asset", async (c) => ({ message: `Uploaded ${c.body.file.name}` }), {
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
