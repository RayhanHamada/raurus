import { getLogger } from "@raurus/logger";
import { S3mini } from "s3mini";
import type { S3Config } from "s3mini";

import type { RuntimeStorageAdapterBaseConfig, RuntimeStorageAdapterFactory } from "@/core";

const adapterId = "s3-mini-storage-adapter";
const log = getLogger("server", adapterId);

export interface S3MiniStorageAdapterOptions extends RuntimeStorageAdapterBaseConfig {
    s3Config: S3Config;
}

export const s3MiniStorageAdapter: RuntimeStorageAdapterFactory<S3MiniStorageAdapterOptions> = (options) => {
    if (!options) {
        throw new Error("S3MiniStorageAdapter requires configuration options.");
    }

    const client = new S3mini(options.s3Config);

    return {
        id: adapterId,
        apiVersion: "1",

        async init() {
            // s3mini requires no explicit initialization — the client is
            // stateless. Placeholder for future backends (e.g., AWS S3 may
            // need credential validation / region discovery).
        },

        async close() {
            // s3mini has no persistent connections to close.
        },

        async checkConnection() {
            try {
                const ok = await client.bucketExists();

                if (!ok) {
                    log.error("S3mini storage connection check failed: bucket does not exist");

                    return {
                        ok: false,
                        code: "CONNECTION" as const,
                        error: new Error("Bucket does not exist"),
                    };
                }

                log.info("S3mini storage connection check succeeded");

                return {
                    ok: true,
                    data: null,
                };
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                log.error("S3mini storage connection check failed", { message });

                return {
                    ok: false,
                    code: "CONNECTION" as const,
                    error: error instanceof Error ? error : new Error("Unknown error"),
                };
            }
        },

        async createPresignedUploadUrl(assetKey) {
            try {
                const url = await client.getPresignedUrl("PUT", assetKey);
                log.info("Generated presigned upload URL", { assetKey });

                return {
                    ok: true,
                    data: { url },
                };
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                log.error("Failed to create presigned upload URL", { message });

                return {
                    ok: false,
                    code: "UPSTREAM" as const,
                    error: error instanceof Error ? error : new Error("Unknown error"),
                };
            }
        },

        async deleteAsset(assetKey) {
            try {
                const deleted = await client.deleteObject(assetKey);
                if (!deleted) {
                    log.warning("Delete asset returned false (object may not exist)", { assetKey });
                    return {
                        ok: false,
                        code: "NOT_FOUND" as const,
                        error: new Error(`Object not found: ${assetKey}`),
                    };
                }
                log.info("Deleted asset", { assetKey });
                return { ok: true, data: null };
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                log.error("Failed to delete asset", { assetKey, message });

                return {
                    ok: false,
                    code: "UPSTREAM" as const,
                    error: error instanceof Error ? error : new Error("Unknown error"),
                };
            }
        },
    };
};
