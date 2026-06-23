import type { RaurusMetadata, RuntimeDatabaseAdapterBaseConfig, RuntimeDatabaseAdapterFactory } from "@raurus/core";

interface MemoryMetadataAdapterConfig extends RuntimeDatabaseAdapterBaseConfig {}

export const memoryDatabaseAdapter: RuntimeDatabaseAdapterFactory<MemoryMetadataAdapterConfig> = (_) => {
    const store = new Map<RaurusMetadata["placeholderId"], RaurusMetadata>();

    return {
        id: "memory-database-adapter",
        apiVersion: "1",

        async checkConnection() {
            return { ok: true, data: null };
        },
        async getMetadata(placeholderId) {
            return { ok: true, data: store.get(placeholderId) ?? null };
        },
        async bulkGetMetadataByPlaceholderIds(placeholderIds) {
            const filteredMetadata = placeholderIds
                .map((id) => store.get(id))
                .filter((metadata): metadata is RaurusMetadata => !!metadata);

            return {
                ok: true,
                data: filteredMetadata,
            };
        },
        async upsertContentMetadata(placeholderId, type, assetKeyOrText) {
            if (type === "photo" || type === "video") {
                store.set(placeholderId, { placeholderId, type, assetKey: assetKeyOrText });
                return { ok: true, data: null };
            }

            store.set(placeholderId, { placeholderId, type, text: assetKeyOrText });
            return { ok: true, data: null };
        },
    };
};
