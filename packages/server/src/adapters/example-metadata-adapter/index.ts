import type {
    RaurusMetadata,
    RuntimeMetadataAdapter,
    RuntimeMetadataAdapterBaseConfig,
    RuntimeMetadataAdapterFactory,
} from "@raurus/core";

interface MemoryMetadataAdapterConfig extends RuntimeMetadataAdapterBaseConfig {}

export const createMemoryMetadataAdapter: RuntimeMetadataAdapterFactory<MemoryMetadataAdapterConfig> = (_) => {
    const store = new Map<RaurusMetadata["placeholderId"], RaurusMetadata>();

    return {
        async checkConnection() {
            return { ok: true };
        },
        async getMetadataByPlaceholderId(placeholderId) {
            return store.get(placeholderId) ?? null;
        },
        async bulkGetMetadataByPlaceholderIds(placeholderIds) {
            return placeholderIds
                .map((id) => store.get(id))
                .filter((metadata): metadata is RaurusMetadata => !!metadata);
        },
        async upsertContentMetadata(placeholderId, type, assetKeyOrText) {
            if (type === "photo" || type === "video") {
                store.set(placeholderId, { placeholderId, type, assetKey: assetKeyOrText });
            } else if (type === "text") {
                store.set(placeholderId, { placeholderId, type, text: assetKeyOrText });
            }
        },
    } satisfies RuntimeMetadataAdapter;
};
