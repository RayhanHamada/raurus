import { Elysia } from "elysia";

import { models } from "./models";

export const routes = new Elysia({ name: "raurus.routes" })
    .use(models)

    .get(
        "/presigned-url",
        (c) => ({
            message: "OK",
            data: { url: `https://example.com/presigned-url?key=${c.query.assetKey}` },
        }),
        {
            query: "PresignedUrlQuery",
            response: {
                200: "PresignedUrlResponse",
                400: "ErrorResponse",
            },
            detail: {
                summary: "Get Presigned URL",
                description:
                    "If implemented, this endpoint would generate a presigned URL for uploading an asset to a storage service.",
                tags: ["Operations"],
            },
        }
    )

    .post("/upload-asset", (c) => ({ message: `Uploaded ${c.body.file.name}` }), {
        body: "UploadAssetBody",
        response: {
            200: "UploadAssetResponse",
            400: "ErrorResponse",
        },
        detail: {
            summary: "Upload Asset",
            description: "Endpoint to upload an asset using Raurus Rest API",
            tags: ["Operations"],
        },
    });
