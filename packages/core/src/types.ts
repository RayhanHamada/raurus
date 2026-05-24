import type { RaurusRuntimeError } from "./errors";

export interface StoredAsset {
    key: string;
    url: string;
    mimeType: string;
    size: number;
}

export interface AssetRecord {
    id: string;
    assetKey: string;
    url: string;
    mimeType: string;
    updatedAt: string;
}

export interface StorageAdapter {
    upload(file: File): Promise<StoredAsset>;
    delete(key: string): Promise<void>;
}

export interface MetadataAdapter {
    get(id: string): Promise<AssetRecord | null>;
    set(id: string, record: AssetRecord): Promise<void>;
    remove(id: string): Promise<void>;
}

export interface PermissionContext {
    request?: unknown;
    user?: unknown;
}

export interface PermissionAdapter {
    canEdit(ctx?: PermissionContext): Promise<boolean>;
}

export interface ValidationOptions {
    allowedMimeTypes?: readonly string[];
    maxFileSizeBytes?: number;
}

export interface RaurusRuntimeOptions {
    storage: StorageAdapter;
    metadata: MetadataAdapter;
    permissions: PermissionAdapter;
    validation?: ValidationOptions;
}

export interface RaurusRuntime {
    getAsset(id: string): Promise<AssetRecord | null>;
    replaceAsset(
        id: string,
        file: File,
        ctx?: PermissionContext
    ): Promise<AssetRecord>;
    removeAsset(id: string, ctx?: PermissionContext): Promise<void>;
    canEdit(ctx?: PermissionContext): Promise<boolean>;
}

export type ReplaceAssetError = RaurusRuntimeError;

export type RemoveAssetError = RaurusRuntimeError;
