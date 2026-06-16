import type { RuntimeMetadataAdapter, RuntimeStorageAdapter } from "@raurus/core";
import { getPackageLogger } from "@raurus/logger";
import { Elysia } from "elysia";

import * as m from "./models";

const log = getPackageLogger("server");

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
            async (_) => {
                log.debug("Health check requested");
                return {
                    status: "OK",
                    message: "RAURUS_ENDPOINT",
                };
            },
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
            async ({ status, set, opts, query: { assetKey, expiresIn } }) => {
                log.debug("Presigned URL requested", { assetKey, expiresIn });

                if (!opts.storage.createPresignedUploadUrl) {
                    log.warning("Storage adapter does not support presigned URLs", { adapterId: opts.storage.id });
                    return status(501, {
                        message: "Error",
                        error: "Storage adapter does not support createPresignedUploadUrl",
                    });
                }

                const result = await opts.storage.createPresignedUploadUrl(assetKey, expiresIn);

                if (!result.ok) {
                    log.error("Failed to create presigned URL", { assetKey, error: result.error.message });
                    const code = m.failureCodeToStatus(result.code);
                    set.status = code;
                    return {
                        message: "Error",
                        error: "Failed to create presigned URL",
                    };
                }

                log.debug("Presigned URL created", { assetKey });
                return status(200, {
                    message: "OK",
                    data: {
                        url: result.data.url,
                    },
                });
            },
            {
                detail: {
                    summary: "Get Presigned Upload URL",
                    description:
                        "If implemented, this endpoint would generate a presigned URL for uploading an asset to a storage service.",
                    tags: ["Operations"],
                },
                query: m.PresignedUrlQuerySchema,
                response: {
                    200: m.PresignedUrlResponseSchema,
                    400: m.ErrorResponseSchema,
                    501: m.ErrorResponseSchema,
                },
            }
        )

        .get(
            "/presigned-download-url",
            async ({ status, set, opts, query: { assetKey, expiresIn } }) => {
                log.debug("Presigned download URL requested", { assetKey, expiresIn });

                if (!opts.storage.createPresignedDownloadUrl) {
                    log.warning("Storage adapter does not support presigned download URLs", {
                        adapterId: opts.storage.id,
                    });
                    return status(501, {
                        message: "Error",
                        error: "Storage adapter does not support createPresignedDownloadUrl",
                    });
                }

                const result = await opts.storage.createPresignedDownloadUrl(assetKey, expiresIn);

                if (!result.ok) {
                    log.error("Failed to create presigned download URL", {
                        assetKey,
                        error: result.error.message,
                    });
                    const code = m.failureCodeToStatus(result.code);
                    set.status = code;
                    return {
                        message: "Error",
                        error: "Failed to create presigned download URL",
                    };
                }

                log.debug("Presigned download URL created", { assetKey });
                return status(200, {
                    message: "OK",
                    data: {
                        url: result.data.url,
                    },
                });
            },
            {
                detail: {
                    summary: "Get Presigned Download URL",
                    description:
                        "If implemented, this endpoint would generate a presigned URL for downloading an asset from a storage service.",
                    tags: ["Operations"],
                },
                query: m.PresignedUrlQuerySchema,
                response: {
                    200: m.PresignedUrlResponseSchema,
                    400: m.ErrorResponseSchema,
                    501: m.ErrorResponseSchema,
                },
            }
        )

        .delete(
            "/asset/:assetKey",
            async ({ status, set, opts, params: { assetKey } }) => {
                log.debug("Delete asset requested", { assetKey });

                if (!opts.storage.deleteAsset) {
                    log.warning("Storage adapter does not support asset deletion", { adapterId: opts.storage.id });
                    return status(501, {
                        message: "Error",
                        error: "Storage adapter does not support deleteAsset",
                    });
                }

                const result = await opts.storage.deleteAsset(assetKey);

                if (!result.ok) {
                    log.error("Failed to delete asset", { assetKey, error: result.error.message });
                    const code = m.failureCodeToStatus(result.code);
                    set.status = code;
                    return {
                        message: "Error",
                        error: "Failed to delete asset",
                    };
                }

                log.debug("Asset deleted", { assetKey });
                return status(200, { message: "OK" });
            },
            {
                detail: {
                    summary: "Delete Asset",
                    description: "If implemented, this endpoint would delete an asset from the storage service.",
                    tags: ["Operations"],
                },
                params: m.DeleteAssetParamsSchema,
                response: {
                    200: m.DeleteAssetResponseSchema,
                    400: m.ErrorResponseSchema,
                    404: m.ErrorResponseSchema,
                    501: m.ErrorResponseSchema,
                },
            }
        )

        .post(
            "/upload-asset",
            async ({ status, opts }) => {
                log.debug("Upload asset requested");

                if (!opts.storage?.createPresignedUploadUrl) {
                    log.warning("Storage adapter does not support direct asset upload", { adapterId: opts.storage.id });
                    return status(501, {
                        message: "Error",
                        error: "Storage adapter does not support uploadAsset",
                    });
                }

                log.debug("Upload asset accepted");
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
                    501: m.ErrorResponseSchema,
                },
            }
        );
}
