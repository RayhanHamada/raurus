import type {
    RaurusAsset,
    RuntimeStorageAdapter,
    RuntimeStorageAdapterBaseConfig,
    RuntimeStorageAdapterFactory,
} from "@raurus/core";

interface MemoryStorageAdapterConfig extends RuntimeStorageAdapterBaseConfig {}

export const createMemoryStorageAdapter: RuntimeStorageAdapterFactory<MemoryStorageAdapterConfig> = (_) => {
    const store = new Map<string, RaurusAsset>();

    const adapter: RuntimeStorageAdapter = {
        id: "memory-storage-adapter",
        apiVersion: "1",

        async checkConnection() {
            return { ok: true, data: null };
        },

        async uploadAsset(assetKey, asset) {
            store.set(assetKey, asset);
            return { ok: true, data: { assetKey } };
        },

        async createPresignedUploadUrl(assetKey, expiresIn) {
            return {
                ok: true,
                data: {
                    url: `https://example.com/upload/${assetKey}?expiresIn=${expiresIn ?? 3600}`,
                },
            };
        },

        async createPresignedDownloadUrl(assetKey, expiresIn) {
            return {
                ok: true,
                data: {
                    url: `https://example.com/download/${assetKey}?expiresIn=${expiresIn ?? 3600}`,
                },
            };
        },

        async deleteAsset(assetKey) {
            store.delete(assetKey);
            return { ok: true, data: null };
        },
    };

    return adapter;
};
