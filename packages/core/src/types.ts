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

export interface IMetadataAdapter {
    get(id: string): Promise<AssetRecord | null>;
    set(id: string, record: AssetRecord): Promise<void>;
    remove(id: string): Promise<void>;
}

export interface IPermissionContext<TRequest = unknown, TUser = unknown> {
    request?: TRequest;
    user?: TUser;
}

export interface IPermissionAdapter<
    TContext extends IPermissionContext = IPermissionContext,
> {
    canEdit(ctx?: TContext): Promise<boolean>;
}

export type IPermissionFactory<T extends IPermissionAdapter> = (
    options: T
) => IPermissionAdapter;

export interface ValidationOptions {
    allowedMimeTypes?: readonly string[];
    maxFileSizeBytes?: number;
}

export interface RaurusRuntimeOptions {
    storage: StorageAdapter;
    metadata: IMetadataAdapter;
    permissions: IPermissionAdapter;
    validation?: ValidationOptions;
}

export interface IRaurusRuntime {
    getAsset(id: string): Promise<AssetRecord | null>;
    replaceAsset(
        id: string,
        file: File,
        ctx?: IPermissionContext
    ): Promise<AssetRecord>;
    removeAsset(id: string, ctx?: IPermissionContext): Promise<void>;
    canEdit(ctx?: IPermissionContext): Promise<boolean>;
}

export type ReplaceAssetError = RaurusRuntimeError;

export type RemoveAssetError = RaurusRuntimeError;
