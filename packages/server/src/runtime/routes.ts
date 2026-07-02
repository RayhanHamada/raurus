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
            .decorate("dependencies", {
                database,
                storage,
            })

            .macro({
                checkDatabase(_: boolean) {
                    return {
                        beforeHandle({ dependencies, status }) {
                            if (!dependencies?.database) {
                                log.warning("Metadata adapter is not configured");

                                return status(501, {
                                    message: "Error",
                                    error: "Metadata adapter is not configured",
                                });
                            }
                        },

                        resolve({ dependencies }) {
                            if (!dependencies?.database) {
                                return;
                            }

                            return {
                                dependencies: {
                                    ...dependencies,
                                    database: dependencies.database,
                                },
                            };
                        },
                    };
                },

                checkStorage(_: boolean) {
                    return {
                        beforeHandle({ dependencies, status }) {
                            if (!dependencies?.storage) {
                                log.warning("Storage adapter is not configured");

                                return status(501, {
                                    message: "Error",
                                    error: "Storage adapter is not configured",
                                });
                            }
                        },

                        resolve({ dependencies }) {
                            if (!dependencies?.storage) {
                                return;
                            }

                            return {
                                dependencies: {
                                    ...dependencies,
                                    storage: dependencies.storage,
                                },
                            };
                        },
                    };
                },
            })

            // Health check (public)
            .get(
                "/",
                async ({ dependencies, status }) => {
                    log.debug("Health check requested");
                    return status(200, {
                        status: "OK",
                        message: "RAURUS_ENDPOINT",
                        data: {
                            database_adapter_id: dependencies.database?.id ?? null,
                            storage_adapter_id: dependencies.storage?.id ?? null,
                        },
                    });
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
                "/placeholders/:placeholder_id/pathnames/:pathname",
                async ({ status, set, params: { pathname, placeholder_id }, dependencies, body }) => {
                    log.debug("Metadata upsert requested", { placeholder_id });

                    const result =
                        body.type === METADATA_TYPES.TEXT
                            ? await dependencies.database.upsertContentMetadata(placeholder_id, pathname, {
                                  type: METADATA_TYPES.TEXT,
                                  text: body.text,
                              })
                            : await dependencies.database.upsertContentMetadata(placeholder_id, pathname, {
                                  type: body.type,
                                  assetKey: body.asset_key,
                              });

                    if (!result.ok) {
                        log.error("Failed to upsert metadata", {
                            placeholderId: placeholder_id,
                            error: result.error.message,
                        });
                        const code = m.failureCodeToStatus(result.code);
                        set.status = code;
                        return {
                            message: "Error",
                            error: "Failed to upsert metadata",
                        };
                    }

                    log.debug("Metadata upserted", { placeholder_id });
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
                async ({ status, set, dependencies, query: { asset_key } }) => {
                    log.debug("Presigned URL requested", { assetKey: asset_key });

                    if (!dependencies.storage.createPresignedUploadUrl) {
                        log.warning("Storage adapter does not support presigned URLs", {
                            adapterId: dependencies.storage.id,
                        });

                        return status(501, {
                            message: "Error",
                            error: "Storage adapter does not support createPresignedUploadUrl",
                        });
                    }

                    const result = await dependencies.storage.createPresignedUploadUrl(asset_key);

                    if (!result.ok) {
                        log.error("Failed to create presigned URL", {
                            asset_key,
                            error: result.error.message,
                        });
                        const code = m.failureCodeToStatus(result.code);
                        set.status = code;
                        return {
                            message: "Error",
                            error: "Failed to create presigned URL",
                        };
                    }

                    log.debug("Presigned URL created", { asset_key });
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
                "/asset/:asset_key",
                async ({ status, set, dependencies, params: { asset_key } }) => {
                    log.debug("Delete asset requested", { assetKey: asset_key });

                    if (!dependencies.storage.deleteAsset) {
                        log.warning("Storage adapter does not support asset deletion", {
                            adapterId: dependencies.storage.id,
                        });

                        return status(501, {
                            message: "Error",
                            error: "Storage adapter does not support deleteAsset",
                        });
                    }

                    const result = await dependencies.storage.deleteAsset(asset_key);

                    if (!result.ok) {
                        log.error("Failed to delete asset", { assetKey: asset_key, error: result.error.message });

                        const code = m.failureCodeToStatus(result.code);
                        set.status = code;

                        return {
                            message: "Error",
                            error: "Failed to delete asset",
                        };
                    }

                    log.debug("Asset deleted", { assetKey: asset_key });
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
