import type { RaurusMetadata, RuntimeMetadataAdapter } from "@raurus/core";

export function createMemoryMetadataAdapter() {
    const store = new Map<RaurusMetadata["placeholderId"], RaurusMetadata>();

    return {
        async getMetadataById(placeholderId) {
            return store.get(placeholderId) ?? null;
        },
        async upsertMetadata(placeholderId, assetKey) {
            store.set(placeholderId, { placeholderId, assetKey });
        },
    } satisfies RuntimeMetadataAdapter;
}
