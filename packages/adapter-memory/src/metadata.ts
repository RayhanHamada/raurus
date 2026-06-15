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
        async getMetadataById(placeholderId) {
            return store.get(placeholderId) ?? null;
        },
        async upsertMetadata(placeholderId, assetKey) {
            store.set(placeholderId, { placeholderId, assetKey });
        },
    } satisfies RuntimeMetadataAdapter;
};
