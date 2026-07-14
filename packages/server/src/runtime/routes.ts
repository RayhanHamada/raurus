import { Elysia } from "elysia";

import type { RuntimeDatabaseAdapter, RuntimeStorageAdapter } from "@/core";
import { log } from "@/runtime/utils";

import * as m from "./models";

interface RouteOptions {
    databaseAdapter: RuntimeDatabaseAdapter;
    storageAdapter: RuntimeStorageAdapter;
}

export function routes({ databaseAdapter, storageAdapter }: RouteOptions) {
    return (
        new Elysia()

            .decorate("db", databaseAdapter)
            .decorate("storage", storageAdapter)

            .put(
                "/placeholders/:placeholder_id/pathnames/:pathname",
                async ({ status, set, params: { pathname, placeholder_id }, db, body }) => {
                    log.debug("Metadata upsert requested", { placeholder_id });

                    const result = await db.upsertContentMetadata(placeholder_id, pathname, body);

                    if (!result.ok) {
                        log.error("Failed to upsert metadata", {
                            placeholder_id,
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
                }
            )

            // Storage routes
            .get(
                "/assets/presigned-upload-url",
                async ({ status, set, storage, query: { assetKey } }) => {
                    log.debug("Presigned URL requested", { asset_key: assetKey });

                    if (!storage.createPresignedUploadUrl) {
                        log.warning("Storage adapter does not support presigned URLs", {
                            adapterId: storage.id,
                        });

                        return status(501, {
                            message: "Error",
                            error: "Storage adapter does not support createPresignedUploadUrl",
                        });
                    }

                    const result = await storage.createPresignedUploadUrl(assetKey);

                    if (!result.ok) {
                        log.error("Failed to create presigned URL", {
                            asset_key: assetKey,
                            error: result.error.message,
                        });
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
                }
            )

            .delete(
                "/asset/:asset_key",
                async ({ status, set, storage, params: { assetKey } }) => {
                    log.debug("Delete asset requested", { assetKey });

                    if (!storage.deleteAsset) {
                        log.warning("Storage adapter does not support asset deletion", {
                            adapterId: storage.id,
                        });

                        return status(501, {
                            message: "Error",
                            error: "Storage adapter does not support deleteAsset",
                        });
                    }

                    const result = await storage.deleteAsset(assetKey);

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
                }
            )
    );
}
