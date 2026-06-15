import type { RuntimeStorageAdapterBaseConfig, RuntimeStorageAdapterFactory } from "@raurus/core";

export interface R2StorageAdapterOptions extends RuntimeStorageAdapterBaseConfig {}

const DEFAULTS = {} satisfies Partial<R2StorageAdapterOptions>;

export const r2: RuntimeStorageAdapterFactory<R2StorageAdapterOptions> = (config) => {
    if (!config) {
        throw new Error("R2StorageAdapter requires a configuration object.");
    }

    const _options = {
        ...DEFAULTS,
        ...config,
    };

    console.log(_options);

    return {
        async checkConnection() {
            return { ok: true };
        },
        async createPresignedUploadUrl(assetKey, expiresIn) {
            throw new Error(
                `Cloudflare R2 does not support presigned upload URLs. Asset Key: ${assetKey}, Expires In: ${expiresIn}`
            );
        },

        async deleteAsset(assetKey) {
            throw new Error(`Cloudflare R2 does not support deleting assets. Asset Key: ${assetKey}`);
        },

        async uploadAsset(assetKey, _data) {
            throw new Error(`Cloudflare R2 does not support uploading assets. Asset Key: ${assetKey}`);
        },
    };
};
