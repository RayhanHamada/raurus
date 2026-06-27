import { METADATA_TYPES } from "@raurus/core";
import type { RuntimeDatabaseAdapter, RuntimeStorageAdapter } from "@raurus/core";
import { Elysia } from "elysia";

import { log } from "@/runtime/utils";

import * as m from "./models";

interface RouteOptions {
    database?: RuntimeDatabaseAdapter | undefined;
    storage?: RuntimeStorageAdapter | undefined;
}

export function routes({ database, storage }: RouteOptions) {
    return (
        new Elysia({ name: "raurus.routes" })
            .derive(() => ({
                custom: {
                    database,
                    storage,
                },
            }))

            .macro({
                checkDatabase(enable: boolean) {
                    return {
                        async beforeHandle({ custom, status }) {
                            if (!enable) {
                                return;
                            }

                            if (!custom?.database) {
                                log.warning("Metadata adapter is not configured");

                                return status(501, {
                                    message: "Error",
                                    error: "Metadata adapter is not configured",
                                });
                            }
                        },

                        resolve({ custom }) {
                            if (!enable) {
                                return { custom };
                            }

                            return {
                                custom: {
                                    ...custom,
                                    database: custom?.database as RuntimeDatabaseAdapter,
                                },
                            };
                        },
                    };
                },

                checkStorage(enable: boolean) {
                    return {
                        async beforeHandle({ custom, status }) {
                            if (!enable) {
                                return;
                            }

                            if (!custom?.storage) {
                                log.warning("Storage adapter is not configured");

                                return status(501, {
                                    message: "Error",
                                    error: "Storage adapter is not configured",
                                });
                            }
                        },

                        resolve({ custom }) {
                            if (!enable) {
                                return {
                                    custom,
                                };
                            }

                            return {
                                custom: {
                                    ...custom,
                                    storage: custom?.storage as RuntimeStorageAdapter,
                                },
                            };
                        },
                    };
                },
            })

            // Health check (public)
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

            .put(
                "/placeholders/:placeholderId/pathnames/:pathname",
                async ({ status, set, params, custom, body }) => {
                    log.debug("Metadata upsert requested", { placeholderId: params.placeholderId });

                    const { placeholderId, pathname } = params;
                    const result =
                        body.type === METADATA_TYPES.TEXT
                            ? await custom.database.upsertContentMetadata(placeholderId, pathname, {
                                  type: METADATA_TYPES.TEXT,
                                  text: body.text,
                              })
                            : await custom.database.upsertContentMetadata(placeholderId, pathname, {
                                  type: body.type,
                                  assetKey: body.assetKey,
                              });

                    if (!result.ok) {
                        log.error("Failed to upsert metadata", {
                            placeholderId: params.placeholderId,
                            error: result.error.message,
                        });
                        const code = m.failureCodeToStatus(result.code);
                        set.status = code;
                        return {
                            message: "Error",
                            error: "Failed to upsert metadata",
                        };
                    }

                    log.debug("Metadata upserted", { placeholderId: params.placeholderId });
                    return status(200, { message: "OK" });
                },
                {
                    detail: {
                        summary: "Upsert Metadata",
                        description: "Create or update a metadata record for a placeholder.",
                        tags: ["Metadata"],
                    },
                    params: m.MetadataParamsSchema,
                    body: m.UpsertMetadataBodySchema,
                    response: {
                        200: m.DeleteAssetResponseSchema,
                        400: m.ErrorResponseSchema,
                        501: m.ErrorResponseSchema,
                    },
                    checkDatabase: true,
                }
            )

            // Storage routes
            .get(
                "/assets/presigned-upload-url",
                async ({ status, set, custom, query: { assetKey } }) => {
                    log.debug("Presigned URL requested", { assetKey });

                    if (!custom.storage.createPresignedUploadUrl) {
                        log.warning("Storage adapter does not support presigned URLs", {
                            adapterId: custom.storage.id,
                        });

                        return status(501, {
                            message: "Error",
                            error: "Storage adapter does not support createPresignedUploadUrl",
                        });
                    }

                    const result = await custom.storage.createPresignedUploadUrl(assetKey);

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
                        description: "Generate a presigned URL for uploading an asset to a storage service.",
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
                async ({ status, set, custom, params: { assetKey } }) => {
                    log.debug("Delete asset requested", { assetKey });

                    if (!custom.storage.deleteAsset) {
                        log.warning("Storage adapter does not support asset deletion", {
                            adapterId: custom.storage.id,
                        });

                        return status(501, {
                            message: "Error",
                            error: "Storage adapter does not support deleteAsset",
                        });
                    }

                    const result = await custom.storage.deleteAsset(assetKey);

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
                        description: "Delete an asset from the storage service.",
                        tags: ["Operations"],
                    },
                    params: m.DeleteAssetParamsSchema,
                    response: {
                        200: m.DeleteAssetResponseSchema,
                        400: m.ErrorResponseSchema,
                        404: m.ErrorResponseSchema,
                        501: m.ErrorResponseSchema,
                    },
                    checkStorage: true,
                }
            )
    );
}
