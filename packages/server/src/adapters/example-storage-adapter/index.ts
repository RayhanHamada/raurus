import type { RuntimeStorageAdapterBaseConfig, RuntimeStorageAdapterFactory } from "@raurus/core";

interface MemoryStorageAdapterConfig extends RuntimeStorageAdapterBaseConfig {}

export const createMemoryStorageAdapter: RuntimeStorageAdapterFactory<MemoryStorageAdapterConfig> = (_) => ({
    id: "memory-storage-adapter",

    async checkConnection() {
        return { ok: true };
    },

    async createPresignedUploadUrl(assetKey, expiresIn) {
        return {
            ok: true,
            data: {
                url: `https://example.com/upload/${assetKey}?expiresIn=${expiresIn}`,
            },
        };
    },
});
