import type { RuntimeAuthAdapter, RuntimeMetadataAdapter, RuntimeStorageAdapter } from "@raurus/core";
import { getPackageLogger } from "@raurus/logger";
import { Elysia } from "elysia";

import * as m from "./models";

const log = getPackageLogger("server");

interface RouteOptions {
    metadata?: RuntimeMetadataAdapter | undefined;
    storage?: RuntimeStorageAdapter | undefined;
    auth?: RuntimeAuthAdapter | undefined;
}

export function routes({ metadata, storage, auth }: RouteOptions) {
    return (
        new Elysia({ name: "raurus.routes" })
            .derive(() => ({
                options: {
                    metadata,
                    storage,
                    auth,
                },
            }))

            .macro({
                checkMetadata(enable: boolean) {
                    return {
                        async beforeHandle({ options, status }) {
                            if (!enable) {
                                return;
                            }

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

                checkAuth(enable: boolean) {
                    return {
                        async beforeHandle({ options, status, request }) {
                            if (!enable) {
                                return;
                            }

                            if (!options?.auth) {
                                log.warning("Auth adapter is not configured");

                                return status(501, {
                                    message: "Error",
                                    error: "Auth adapter is not configured",
                                });
                            }

                            const header = request.headers.get("authorization");
                            if (!header || !header.startsWith("Bearer ")) {
                                log.warning("Missing or invalid authorization header");

                                return status(401, {
                                    message: "Error",
                                    error: "Missing or invalid authorization header",
                                });
                            }

                            const token = header.slice("Bearer ".length);

                            const result = await options.auth.validateToken(token);
                            if (!result.ok || !result.data.valid) {
                                log.warning("Invalid or expired token");

                                return status(401, {
                                    message: "Error",
                                    error: "Invalid or expired token",
                                });
                            }
                        },

                        resolve({ options }) {
                            if (!enable) {
                                return { options };
                            }

                            return {
                                options: {
                                    ...options,
                                    auth: options?.auth as RuntimeAuthAdapter,
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

            // Auth routes
            .post(
                "/auth/login",
                async ({ status, set, options, body: { password } }) => {
                    log.debug("Login requested");

                    if (!options.auth) {
                        log.warning("Auth adapter is not configured");

                        return status(501, {
                            message: "Error",
                            error: "Auth adapter is not configured",
                        });
                    }

                    const result = await options.auth.authenticate(password);

                    if (!result.ok) {
                        log.error("Authentication failed", { error: result.error.message });
                        const code = m.failureCodeToStatus(result.code);
                        set.status = code;
                        return {
                            message: "Error",
                            error: "Authentication failed",
                        };
                    }

                    log.debug("Login successful");
                    return status(200, {
                        message: "OK",
                        data: {
                            token: result.data.token,
                        },
                    });
                },
                {
                    detail: {
                        summary: "Login",
                        description: "Authenticate with a password and receive a session token.",
                        tags: ["Auth"],
                    },
                    body: m.LoginBodySchema,
                    response: {
                        200: m.LoginResponseSchema,
                        400: m.ErrorResponseSchema,
                        501: m.ErrorResponseSchema,
                    },
                }
            )

            .get(
                "/auth/verify",
                async (_) => {
                    log.debug("Session verification requested");
                    return {
                        message: "OK",
                        data: {
                            valid: true as const,
                        },
                    };
                },
                {
                    detail: {
                        summary: "Verify Session",
                        description: "Verify that the current session token is valid.",
                        tags: ["Auth"],
                    },
                    response: {
                        200: m.VerifySessionResponseSchema,
                        401: m.ErrorResponseSchema,
                        501: m.ErrorResponseSchema,
                    },
                    checkAuth: true,
                }
            )

            // Metadata routes (auth guarded)
            .get(
                "/metadata",
                async ({ status, set, options, query }) => {
                    log.debug("Metadata list requested");

                    if (!options.metadata) {
                        log.warning("Metadata adapter is not configured");

                        return status(501, {
                            message: "Error",
                            error: "Metadata adapter is not configured",
                        });
                    }

                    const placeholderIdsRaw = query?.placeholderIds;
                    const placeholderIds = placeholderIdsRaw
                        ? placeholderIdsRaw
                              .split(",")
                              .map((s: string) => s.trim())
                              .filter(Boolean)
                        : [];

                    const result = await options.metadata.bulkGetMetadataByPlaceholderIds(placeholderIds);

                    if (!result.ok) {
                        log.error("Failed to list metadata", { error: result.error.message });
                        const code = m.failureCodeToStatus(result.code);
                        set.status = code;
                        return {
                            message: "Error",
                            error: "Failed to list metadata",
                        };
                    }

                    log.debug("Metadata list returned", { count: result.data.length });
                    return status(200, {
                        message: "OK",
                        data: result.data,
                    });
                },
                {
                    detail: {
                        summary: "List Metadata",
                        description:
                            "List metadata records by placeholder IDs. Provide `placeholderIds` as a comma-separated list.",
                        tags: ["Metadata"],
                    },
                    query: m.MetadataListQuerySchema,
                    response: {
                        200: m.MetadataListResponseSchema,
                        400: m.ErrorResponseSchema,
                        401: m.ErrorResponseSchema,
                        501: m.ErrorResponseSchema,
                    },
                    checkAuth: true,
                }
            )

            .get(
                "/metadata/:placeholderId",
                async ({ status, set, options, params: { placeholderId } }) => {
                    log.debug("Metadata get requested", { placeholderId });

                    if (!options.metadata) {
                        log.warning("Metadata adapter is not configured");

                        return status(501, {
                            message: "Error",
                            error: "Metadata adapter is not configured",
                        });
                    }

                    const result = await options.metadata.getMetadataByPlaceholderId(placeholderId);

                    if (!result.ok) {
                        log.error("Failed to get metadata", { placeholderId, error: result.error.message });
                        const code = m.failureCodeToStatus(result.code);
                        set.status = code;
                        return {
                            message: "Error",
                            error: "Failed to get metadata",
                        };
                    }

                    if (result.data === null) {
                        set.status = 404;
                        return {
                            message: "Error",
                            error: "Metadata not found",
                        };
                    }

                    log.debug("Metadata returned", { placeholderId });
                    return result.data;
                },
                {
                    detail: {
                        summary: "Get Metadata",
                        description: "Get a single metadata record by placeholder ID.",
                        tags: ["Metadata"],
                    },
                    params: m.MetadataParamsSchema,
                    response: {
                        200: m.MetadataResponseSchema,
                        400: m.ErrorResponseSchema,
                        401: m.ErrorResponseSchema,
                        404: m.ErrorResponseSchema,
                        501: m.ErrorResponseSchema,
                    },
                    checkAuth: true,
                }
            )

            .put(
                "/metadata/:placeholderId",
                async ({ status, set, options, params: { placeholderId }, body }) => {
                    log.debug("Metadata upsert requested", { placeholderId });

                    if (!options.metadata) {
                        log.warning("Metadata adapter is not configured");

                        return status(501, {
                            message: "Error",
                            error: "Metadata adapter is not configured",
                        });
                    }

                    const result =
                        body.type === "text"
                            ? await options.metadata.upsertContentMetadata(placeholderId, body.type, body.text)
                            : await options.metadata.upsertContentMetadata(placeholderId, body.type, body.assetKey);

                    if (!result.ok) {
                        log.error("Failed to upsert metadata", { placeholderId, error: result.error.message });
                        const code = m.failureCodeToStatus(result.code);
                        set.status = code;
                        return {
                            message: "Error",
                            error: "Failed to upsert metadata",
                        };
                    }

                    log.debug("Metadata upserted", { placeholderId });
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
                        401: m.ErrorResponseSchema,
                        501: m.ErrorResponseSchema,
                    },
                    checkAuth: true,
                    checkMetadata: true,
                }
            )

            // Asset content serving (public)
            .get(
                "/asset-content/:assetKey",
                async ({ status, set, options, params: { assetKey } }) => {
                    log.debug("Asset content requested", { assetKey });

                    if (!options.storage) {
                        log.warning("Storage adapter is not configured");

                        return status(501, {
                            message: "Error",
                            error: "Storage adapter is not configured",
                        });
                    }

                    if (!options.storage.getAssetContent) {
                        log.warning("Storage adapter does not support asset content", {
                            adapterId: options.storage.id,
                        });

                        return status(501, {
                            message: "Error",
                            error: "Storage adapter does not support getAssetContent",
                        });
                    }

                    const result = await options.storage.getAssetContent(assetKey);

                    if (!result.ok) {
                        log.error("Failed to get asset content", { assetKey, error: result.error.message });
                        const code = m.failureCodeToStatus(result.code);
                        set.status = code;
                        return {
                            message: "Error",
                            error: "Failed to get asset content",
                        };
                    }

                    set.headers["content-type"] = result.data.contentType;
                    return new Response(result.data.data, {
                        status: 200,
                        headers: { "content-type": result.data.contentType },
                    });
                },
                {
                    detail: {
                        summary: "Get Asset Content",
                        description:
                            "Returns the raw content of an asset by its key. Public endpoint — no authentication required so media can be displayed for all visitors.",
                        tags: ["Operations"],
                    },
                    params: m.AssetContentParamsSchema,
                }
            )

            // Storage routes (auth guarded)
            .get(
                "/presigned-url",
                async ({ status, set, options, query: { assetKey, expiresIn } }) => {
                    log.debug("Presigned URL requested", { assetKey, expiresIn });

                    if (!options.storage.createPresignedUploadUrl) {
                        log.warning("Storage adapter does not support presigned URLs", {
                            adapterId: options.storage.id,
                        });

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
                            "Generate a presigned URL for uploading an asset to a storage service. Requires authentication.",
                        tags: ["Operations"],
                    },
                    query: m.PresignedUrlQuerySchema,
                    response: {
                        200: m.PresignedUrlResponseSchema,
                        400: m.ErrorResponseSchema,
                        401: m.ErrorResponseSchema,
                        501: m.ErrorResponseSchema,
                    },
                    checkAuth: true,
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
                            "Generate a presigned URL for downloading an asset from a storage service. Requires authentication.",
                        tags: ["Operations"],
                    },
                    query: m.PresignedUrlQuerySchema,
                    response: {
                        200: m.PresignedUrlResponseSchema,
                        400: m.ErrorResponseSchema,
                        401: m.ErrorResponseSchema,
                        501: m.ErrorResponseSchema,
                    },
                    checkAuth: true,
                    checkStorage: true,
                }
            )

            .delete(
                "/asset/:assetKey",
                async ({ status, set, options, params: { assetKey } }) => {
                    log.debug("Delete asset requested", { assetKey });

                    if (!options.storage) {
                        log.warning("Storage adapter is not configured");

                        return status(501, {
                            message: "Error",
                            error: "Storage adapter is not configured",
                        });
                    }

                    if (!options.storage.deleteAsset) {
                        log.warning("Storage adapter does not support asset deletion", {
                            adapterId: options.storage.id,
                        });

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
                        description: "Delete an asset from the storage service. Requires authentication.",
                        tags: ["Operations"],
                    },
                    params: m.DeleteAssetParamsSchema,
                    response: {
                        200: m.DeleteAssetResponseSchema,
                        400: m.ErrorResponseSchema,
                        401: m.ErrorResponseSchema,
                        404: m.ErrorResponseSchema,
                        501: m.ErrorResponseSchema,
                    },
                    checkAuth: true,
                }
            )

            .post(
                "/upload-asset",
                async ({ status, set, options, body }) => {
                    log.debug("Upload asset requested");

                    if (!options.storage) {
                        log.warning("Storage adapter is not configured");

                        return status(501, {
                            message: "Error",
                            error: "Storage adapter is not configured",
                        });
                    }

                    if (!options.storage.uploadAsset) {
                        log.warning("Storage adapter does not support direct asset upload", {
                            adapterId: options.storage.id,
                        });

                        return status(501, {
                            message: "Error",
                            error: "Storage adapter does not support uploadAsset",
                        });
                    }

                    const { files } = body;
                    const firstFile = Array.isArray(files) ? files[0] : files;
                    if (!firstFile) {
                        log.error("No file provided");

                        return status(400, {
                            message: "Error",
                            error: "No file provided",
                        });
                    }
                    const buffer = await firstFile.arrayBuffer();
                    const ext = firstFile.name.includes(".") ? firstFile.name.split(".").pop() || "bin" : "bin";
                    const assetKey = `${crypto.randomUUID()}.${ext}`;

                    const result = await options.storage.uploadAsset(assetKey, buffer);

                    if (!result.ok) {
                        log.error("Failed to upload asset", { assetKey, error: result.error.message });
                        const code = m.failureCodeToStatus(result.code);
                        set.status = code;
                        return {
                            message: "Error",
                            error: "Failed to upload asset",
                        };
                    }

                    log.debug("Asset uploaded", { assetKey });
                    return status(200, {
                        message: "OK",
                        data: {
                            assetKey,
                        },
                    });
                },
                {
                    detail: {
                        summary: "Upload Asset",
                        description:
                            "Upload an asset file. The file is stored via the configured storage adapter and an asset key is returned. Requires authentication.",
                        tags: ["Operations"],
                    },
                    body: m.UploadAssetBodySchema,
                    response: {
                        200: m.UploadAssetResponseSchema,
                        400: m.ErrorResponseSchema,
                        401: m.ErrorResponseSchema,
                        501: m.ErrorResponseSchema,
                    },
                    checkAuth: true,
                }
            )
    );
}
