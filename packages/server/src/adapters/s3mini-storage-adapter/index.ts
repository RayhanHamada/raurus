import type { RuntimeStorageAdapterBaseConfig, RuntimeStorageAdapterFactory } from "@raurus/core";
import { getPackageLogger } from "@raurus/logger";
import { S3mini } from "s3mini";
import type { S3Config } from "s3mini";

const log = getPackageLogger("server");

/**
 * Defines the configuration options for the S3MiniStorageAdapter, which extends both the S3 configuration options and the base configuration for runtime storage adapters. This interface allows for the specification of necessary settings required to connect to an S3-compatible storage service using the S3mini library, as well as any additional configuration options needed for the runtime storage adapter functionality.
 */
export interface S3MiniStorageAdapterOptions extends RuntimeStorageAdapterBaseConfig {
    s3Config: S3Config;
}

/**
 * Defines a storage adapter that utilizes the S3mini library to interact with an S3-compatible storage service.
 * @see
 *
 * @param options The configuration options for the S3MiniStorageAdapter, which include both S3 configuration options and runtime storage adapter base configuration options.
 * @returns An object that implements the RuntimeStorageAdapter interface, providing methods for checking the connection and generating presigned upload URLs.
 */
export const s3MiniStorageAdapter: RuntimeStorageAdapterFactory<S3MiniStorageAdapterOptions> = (options) => {
    if (!options) {
        throw new Error("S3MiniStorageAdapter requires configuration options.");
    }

    const client = new S3mini(options.s3Config);

    return {
        id: "s3-mini-storage-adapter",

        async checkConnection() {
            try {
                const ok = await client.bucketExists();

                return { ok };
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                log.error("S3mini storage connection check failed", { message });
                return {
                    ok: false,
                    message,
                };
            }
        },

        async createPresignedUploadUrl(assetKey, expiresIn) {
            const url = await client.getPresignedUrl("PUT", assetKey, expiresIn);
            return {
                ok: true,
                data: {
                    url,
                },
            };
        },
    };
};
