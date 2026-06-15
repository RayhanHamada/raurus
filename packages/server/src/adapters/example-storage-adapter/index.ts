import type { RuntimeStorageAdapterBaseConfig, RuntimeStorageAdapterFactory } from "@raurus/core";

interface MemoryStorageAdapterConfig extends RuntimeStorageAdapterBaseConfig {}

export const createMemoryStorageAdapter: RuntimeStorageAdapterFactory<MemoryStorageAdapterConfig> = (_) => ({
    async checkConnection() {
        return { ok: true };
    },
    async createPresignedUploadUrl(assetKey, expiresIn) {
        return `https://example.com/upload/${assetKey}?expiresIn=${expiresIn}`;
    },
});
