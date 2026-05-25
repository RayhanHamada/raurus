// oxlint-disable typescript/no-explicit-any
import type { RaurusRuntimeError } from "@/errors";

export interface StoredAsset {
    key: string;
    url: string;
    mimeType: string;
    size: number;
}

export interface IAssetRecord {
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

/**
 * Metadata Related
 */

/**
 * The base options for creating a metadata adapter. This can be extended by specific implementations to include additional configuration options.
 */
export interface IMetadataAdapterFactoryBaseOptions {}
export interface IMetadataAdapter {
    get(id: string): Promise<IAssetRecord | null>;
    set(id: string, record: IAssetRecord): Promise<void>;
    remove(id: string): Promise<void>;
}

/**
 * A factory function type for creating an instance of a metadata adapter. It takes in options of type T, which extends the base options, and returns an instance of IMetadataAdapter.
 */
export type IMetadataAdapterFactory<
    T extends IMetadataAdapterFactoryBaseOptions,
> = (options: T) => IMetadataAdapter;

/**
 *
 */

/**
 * The context object passed to permission checks. It can include information about the current request and user.
 */
export interface IPermissionContext<TRequest = unknown, TUser = unknown> {
    request?: TRequest;
    user?: TUser;
}

/**
 * The base options for creating a permission adapter. This can be extended by specific implementations to include additional configuration options.
 */
export interface IPermissionAdapterFactoryBaseOption {}
export interface IPermissionAdapter<
    TContext extends IPermissionContext = IPermissionContext,
> {
    canEdit(ctx?: TContext): Promise<boolean>;
}

export type IPermissionAdapterFactory<
    T extends IPermissionAdapterFactoryBaseOption,
    TContext extends IPermissionContext = IPermissionContext,
> = (options: T) => IPermissionAdapter<TContext>;

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
    getAsset(id: string): Promise<IAssetRecord | null>;
    replaceAsset(
        id: string,
        file: File,
        ctx?: IPermissionContext
    ): Promise<IAssetRecord>;
    removeAsset(id: string, ctx?: IPermissionContext): Promise<void>;
    canEdit(ctx?: IPermissionContext): Promise<boolean>;
}

export type ReplaceAssetError = RaurusRuntimeError;

export type RemoveAssetError = RaurusRuntimeError;
