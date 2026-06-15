import type { D1Database } from "@cloudflare/workers-types";
import type { RuntimeMetadataAdapterBaseConfig, RuntimeMetadataAdapterFactory } from "@raurus/core";

export interface D1MetadataAdapterOptions extends RuntimeMetadataAdapterBaseConfig {
    /**
     * The D1Database instance to be used for metadata operations. This instance should be properly initialized and connected to the desired D1 database before being passed to the adapter.
     */
    db: D1Database;

    /**
     * A string prefix to be used for all table names in the D1 database. This allows for namespacing and organization of tables related to the metadata adapter. The default value is "raurus_".
     * @default "raurus_"
     */
    tablePrefix?: `${string}_`;
}

const DEFAULTS = {
    tablePrefix: "raurus_",
} as const satisfies Partial<D1MetadataAdapterOptions>;

export const d1: RuntimeMetadataAdapterFactory<D1MetadataAdapterOptions> = (config) => {
    if (!config) {
        throw new Error("D1MetadataAdapter requires a configuration object.");
    }

    const _options = {
        ...DEFAULTS,
        ...config,
    };

    return {
        async getMetadataById(placeholderId) {
            throw new Error(`Cloudflare D1 does not support metadata by ID. Placeholder ID: ${placeholderId}`);
        },

        async upsertMetadata(placeholderId, assetKey) {
            throw new Error(
                `Cloudflare D1 does not support upserting metadata. Placeholder ID: ${placeholderId}, Asset Key: ${assetKey}`
            );
        },
    };
};
