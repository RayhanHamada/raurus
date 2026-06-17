import type { RuntimeMetadataAdapter, RuntimeStorageAdapter } from "@raurus/core";
import { getPackageLogger } from "@raurus/logger";
import { Elysia } from "elysia";

import * as m from "./models";

const log = getPackageLogger("server");

interface RouteOptions {
    // Define any options needed for route generation here
    metadata?: RuntimeMetadataAdapter | undefined;
    storage?: RuntimeStorageAdapter | undefined;
}

export function routes({ metadata, storage }: RouteOptions) {
    return new Elysia({ name: "raurus.routes" })
        .derive(() => ({
            options: {
                metadata,
                storage,
            },
        }))

        .macro({
            checkMetadata(enable: boolean) {
                return {
                    async beforeHandle({ options, status }) {
                        if (!enable) {
                            return;
                        }

                        // Check if metadata adapter is configured
                        if (!options?.metadata) {
                            log.warning("Metadata adapter is not configured");

                            return status(501, {
                                message: "Error",
                                error: "Metadata adapter is not configured",
                            });
                        }
                    },

                    resolve({ options }) {
                        if (!enable) {
                            return {
                                options,
                            };
                        }

                        return {
                            options: {
                                ...options,
                                metadata: options?.metadata as RuntimeMetadataAdapter,
                            },
                        };
                    },
                };
            },

            checkStorage(enable: boolean) {
                return {
                    async beforeHandle({ options, status }) {
                        if (!enable) {
                            return;
                        }

                        // Check if storage adapter is configured
                        if (!options?.storage) {
                            log.warning("Storage adapter is not configured");

                            return status(501, {
                                message: "Error",
                                error: "Storage adapter is not configured",
                            });
                        }
                    },

                    resolve({ options }) {
                        if (!enable) {
                            return {
                                options,
                            };
                        }

                        return {
                            options: {
                                ...options,
                                storage: options?.storage as RuntimeStorageAdapter,
                            },
                        };
                    },
                };
            },
        })

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
            async ({ status, set, options, query: { assetKey, expiresIn } }) => {
                log.debug("Presigned URL requested", { assetKey, expiresIn });

                if (!options.storage.createPresignedUploadUrl) {
                    log.warning("Storage adapter does not support presigned URLs", { adapterId: options.storage.id });

                    return status(501, {
                        message: "Error",
                        error: "Storage adapter does not support createPresignedUploadUrl",
                    });
                }

                const result = await options.storage.createPresignedUploadUrl(assetKey, expiresIn);

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
                checkStorage: true,
                checkMetadata: true,
            }
        )

        .get(
            "/presigned-download-url",
            async ({ status, set, options, query: { assetKey, expiresIn } }) => {
                log.debug("Presigned download URL requested", { assetKey, expiresIn });

                if (!options.storage.createPresignedDownloadUrl) {
                    log.warning("Storage adapter does not support presigned download URLs", {
                        adapterId: options.storage.id,
                    });

                    return status(501, {
                        message: "Error",
                        error: "Storage adapter does not support createPresignedDownloadUrl",
                    });
                }

                const result = await options.storage.createPresignedDownloadUrl(assetKey, expiresIn);

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

                checkStorage: true,
            }
        )

        .delete(
            "/asset/:assetKey",
            async ({ status, set, options, params: { assetKey } }) => {
                if (!options.storage) {
                    log.warning("Storage adapter is not configured");

                    return status(501, {
                        message: "Error",
                        error: "Storage adapter is not configured",
                    });
                }

                log.debug("Delete asset requested", { assetKey });

                if (!options.storage.deleteAsset) {
                    log.warning("Storage adapter does not support asset deletion", { adapterId: options.storage.id });

                    return status(501, {
                        message: "Error",
                        error: "Storage adapter does not support deleteAsset",
                    });
                }

                const result = await options.storage.deleteAsset(assetKey);

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
            async ({ status, options }) => {
                log.debug("Upload asset requested");

                if (!options.storage) {
                    log.warning("Storage adapter is not configured");

                    return status(501, {
                        message: "Error",
                        error: "Storage adapter is not configured",
                    });
                }

                if (!options.storage?.createPresignedUploadUrl) {
                    log.warning("Storage adapter does not support direct asset upload", {
                        adapterId: options.storage.id,
                    });

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
