import type { RuntimeStorageAdapterBaseConfig, RuntimeStorageAdapterFactory } from "@raurus/core";

interface MemoryStorageAdapterConfig extends RuntimeStorageAdapterBaseConfig {}

export const createMemoryStorageAdapter: RuntimeStorageAdapterFactory<MemoryStorageAdapterConfig> = (_) => {
    const store = new Map<string, Uint8Array>();

    return {
        async uploadAsset(assetKey, data) {
            let buffer: Uint8Array;
            if (data instanceof Blob) {
                buffer = new Uint8Array(await data.arrayBuffer());
            } else if (data instanceof File) {
                buffer = new Uint8Array(await data.arrayBuffer());
            } else {
                buffer = new Uint8Array(data);
            }
            store.set(assetKey, buffer);
        },
        async deleteAsset(assetKey) {
            store.delete(assetKey);
        },
    };
};
