import { RaurusRuntimeError, isRaurusRuntimeError } from "./errors";
import type {
    AssetRecord,
    IPermissionContext,
    IRaurusRuntime,
    RaurusRuntimeOptions,
    StoredAsset,
} from "./types";

export const DEFAULT_ALLOWED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
] as const;

export const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const toAssetRecord = (id: string, storedAsset: StoredAsset): AssetRecord => ({
    assetKey: storedAsset.key,
    id,
    mimeType: storedAsset.mimeType,
    updatedAt: new Date().toISOString(),
    url: storedAsset.url,
});

const validateFile = (
    file: File,
    allowedMimeTypes: readonly string[],
    maxFileSizeBytes: number
): void => {
    if (!allowedMimeTypes.includes(file.type)) {
        throw new RaurusRuntimeError(
            "INVALID_MIME_TYPE",
            `Unsupported file type: ${file.type || "unknown"}`
        );
    }

    if (file.size > maxFileSizeBytes) {
        throw new RaurusRuntimeError(
            "FILE_TOO_LARGE",
            `File size ${file.size} exceeds limit ${maxFileSizeBytes}`
        );
    }
};

const assertCanEdit = async (
    runtime: Pick<RaurusRuntimeOptions, "permissions">,
    ctx?: IPermissionContext
): Promise<void> => {
    const allowed = await runtime.permissions.canEdit(ctx);

    if (!allowed) {
        throw new RaurusRuntimeError(
            "PERMISSION_DENIED",
            "Editing is not allowed for the current context."
        );
    }
};

export const createRaurusRuntime = (
    options: RaurusRuntimeOptions
): IRaurusRuntime => {
    const allowedMimeTypes =
        options.validation?.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES;
    const maxFileSizeBytes =
        options.validation?.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;

    return {
        canEdit(ctx?: IPermissionContext): Promise<boolean> {
            return options.permissions.canEdit(ctx);
        },

        getAsset(id: string): Promise<AssetRecord | null> {
            return options.metadata.get(id);
        },

        async removeAsset(id: string, ctx?: IPermissionContext): Promise<void> {
            await assertCanEdit(options, ctx);

            const record = await options.metadata.get(id);

            if (!record) {
                throw new RaurusRuntimeError(
                    "MISSING_ASSET",
                    `No asset found for ${id}.`
                );
            }

            await options.metadata.remove(id);
            await options.storage.delete(record.assetKey);
        },

        async replaceAsset(
            id: string,
            file: File,
            ctx?: IPermissionContext
        ): Promise<AssetRecord> {
            await assertCanEdit(options, ctx);
            validateFile(file, allowedMimeTypes, maxFileSizeBytes);

            let storedAsset: StoredAsset | null = null;

            try {
                try {
                    storedAsset = await options.storage.upload(file);
                } catch (error) {
                    throw new RaurusRuntimeError(
                        "UPLOAD_FAILED",
                        `Failed to upload asset for ${id}.`,
                        error
                    );
                }

                const record = toAssetRecord(id, storedAsset);

                try {
                    await options.metadata.set(id, record);
                } catch (error) {
                    if (storedAsset) {
                        try {
                            await options.storage.delete(storedAsset.key);
                        } catch {
                            // Cleanup is best-effort; the primary error remains the persistence failure.
                        }
                    }

                    throw new RaurusRuntimeError(
                        "METADATA_PERSISTENCE_FAILED",
                        `Failed to persist metadata for ${id}.`,
                        error
                    );
                }

                return record;
            } catch (error) {
                if (isRaurusRuntimeError(error)) {
                    throw error;
                }

                throw new RaurusRuntimeError(
                    "UPLOAD_FAILED",
                    `Failed to replace asset for ${id}.`,
                    error
                );
            }
        },
    };
};
