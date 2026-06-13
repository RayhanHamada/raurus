import type { RaurusMetadata, RaurusMetadataAdapter } from "@raurus/core";

export function createMemoryMetadataAdapter(): RaurusMetadataAdapter {
    const store = new Map<RaurusMetadata["placeholderId"], RaurusMetadata>();

    return {
        async getMetadataById(placeholderId) {
            return store.get(placeholderId) ?? null;
        },
        async upsertMetadata(placeholderId, assetKey) {
            store.set(placeholderId, { placeholderId, assetKey });
        },
    };
}
