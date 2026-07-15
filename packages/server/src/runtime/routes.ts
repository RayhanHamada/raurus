import { ORPCError, implement } from "@orpc/server";
import { contracts, FAILURE_CODES } from "@raurus/contract";

import type { RuntimeDatabaseAdapter, RuntimeStorageAdapter } from "@/core";
import { log } from "@/runtime/utils";

import { failureCodeToStatus } from "./models";

// ---------------------------------------------------------------------------
// Context type — adapters threaded to every procedure via .$context()
// ---------------------------------------------------------------------------

export interface ServerContext {
    db: RuntimeDatabaseAdapter;
    storage: RuntimeStorageAdapter;
}

// ---------------------------------------------------------------------------
// Implementer — wraps the shared contracts, expects ServerContext
// ---------------------------------------------------------------------------

const base = implement(contracts).$context<ServerContext>();

// ---------------------------------------------------------------------------
// Procedure implementations
// ---------------------------------------------------------------------------

// -- upsertMetadata ---------------------------------------------------------

const upsertMetadata = base.upsertMetadata.handler(
    async ({ input: { body, pathname, placeholder_id }, context: { db } }) => {
        log.debug("Metadata upsert requested", { placeholder_id, pathname });

        // Check / seed the placeholder definition.
        // The first type for a given placeholder_id wins — subsequent
        // upserts with a different type are silently accepted (no-op)
        // to keep the editing experience frictionless.
        const defResult = await db.getOrSeedPlaceholderDefinition(placeholder_id, body.type);
        if (!defResult.ok) {
            log.warning("Placeholder type mismatch — silently ignoring upsert", {
                placeholder_id,
                requestedType: body.type,
                error: defResult.error.message,
            });

            return { message: "OK" as const };
        }

        const result = await db.upsertContentMetadata(placeholder_id, pathname, body);

        if (!result.ok) {
            log.error("Failed to upsert metadata", {
                placeholder_id,
                error: result.error.message,
            });

            throw new ORPCError("NOT_IMPLEMENTED", {
                status: failureCodeToStatus(result.code),
                message: "Error",
                data: { name: "Failed to upsert metadata" },
            });
        }

        log.debug("Metadata upserted", { placeholder_id });
        return { message: "OK" as const };
    }
);

// -- getPresignedUploadUrl ---------------------------------------------------

const getPresignedUploadUrl = base.getPresignedUploadUrl.handler(
    async ({ input: { assetKey }, context: { storage } }) => {
        log.debug("Presigned URL requested", { asset_key: assetKey });

        if (!storage.createPresignedUploadUrl) {
            log.warning("Storage adapter does not support presigned URLs", {
                adapterId: storage.id,
            });
            throw new ORPCError("NOT_IMPLEMENTED", {
                status: 501,
                data: { name: "Storage adapter does not support createPresignedUploadUrl" },
            });
        }

        const result = await storage.createPresignedUploadUrl(assetKey);

        if (!result.ok) {
            log.error("Failed to create presigned URL", {
                asset_key: assetKey,
                error: result.error.message,
            });
            throw new ORPCError("NOT_IMPLEMENTED", {
                status: failureCodeToStatus(result.code),
                data: { name: "Failed to create presigned URL" },
            });
        }

        log.debug("Presigned URL created", { assetKey });
        return {
            message: "OK" as const,
            data: { url: result.data.url },
        };
    }
);

// -- deleteAsset -------------------------------------------------------------

const deleteAsset = base.deleteAsset.handler(async ({ input: { assetKey }, context: { storage } }) => {
    log.debug("Delete asset requested", { assetKey });

    if (!storage.deleteAsset) {
        log.warning("Storage adapter does not support asset deletion", {
            adapterId: storage.id,
        });
        throw new ORPCError("NOT_IMPLEMENTED", {
            status: 501,
            data: { name: "Storage adapter does not support deleteAsset" },
        });
    }

    const result = await storage.deleteAsset(assetKey);

    if (!result.ok) {
        log.error("Failed to delete asset", { assetKey, error: result.error.message });

        const { code } = result;
        if (code === FAILURE_CODES.NOT_FOUND) {
            throw new ORPCError("NOT_FOUND", {
                status: 404,
                data: { name: "Failed to delete asset" },
            });
        }

        throw new ORPCError("NOT_IMPLEMENTED", {
            status: failureCodeToStatus(code),
            data: { name: "Failed to delete asset" },
        });
    }

    log.debug("Asset deleted", { assetKey });
    return { message: "OK" as const };
});

// -- listMetadataByPathname --------------------------------------------------

const listMetadataByPathname = base.listMetadataByPathname.handler(async ({ input: { pathname }, context: { db } }) => {
    log.debug("List metadata requested", { pathname });

    const result = await db.listContentMetadataByPath(pathname);

    if (!result.ok) {
        log.error("Failed to list metadata", {
            pathname,
            error: result.error.message,
        });
        throw new ORPCError("NOT_IMPLEMENTED", {
            status: failureCodeToStatus(result.code),
            data: { name: "Failed to list metadata by pathname" },
        });
    }

    log.debug("Metadata listed", { pathname, count: result.data.length });
    return { message: "OK" as const, data: result.data };
});

// ---------------------------------------------------------------------------
// Router — plain object matching the contract shape
// ---------------------------------------------------------------------------

export const router = {
    upsertMetadata,
    getPresignedUploadUrl,
    deleteAsset,
    listMetadataByPathname,
};

export type Router = typeof router;
