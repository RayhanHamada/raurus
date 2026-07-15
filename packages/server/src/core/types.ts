// oxlint-disable typescript/unified-signatures
import type { FAILURE_CODES, METADATA_TYPES } from "./constants";

export type FailureCode = (typeof FAILURE_CODES)[keyof typeof FAILURE_CODES];

export interface Success<T> {
    ok: true;
    data: T;
}

export interface Failure {
    ok: false;
    error: Error;
    code?: FailureCode;
}

export type AdapterAPIResult<T> = Success<T> | Failure;

export type PhotoMetadataType = typeof METADATA_TYPES.PHOTO;
export type TextMetadataType = typeof METADATA_TYPES.TEXT;
export type LinkMetadataType = typeof METADATA_TYPES.LINK;

export type RaurusMetadataType = PhotoMetadataType | TextMetadataType | LinkMetadataType;

export type RaurusMetadataPayload =
    | {
          type: PhotoMetadataType;
          assetKey: string;
      }
    | {
          type: TextMetadataType;
          text: string;
      }
    | {
          type: LinkMetadataType;
          text: string;
          link: string;
      };

export type RaurusMetadata = { placeholderId: string } & RaurusMetadataPayload;

export type RaurusMetadataWithPath = RaurusMetadata & { pathname: string };

export interface RuntimeDatabaseAdapterBaseConfig {}

export interface RuntimeStorageAdapterBaseConfig {}

/**
 * Lifecycle contract that every adapter must implement. `init()` is called
 * lazily on the first adapter method invocation by the runtime's
 * `withAutoInit()` wrapper; `close()` releases resources and is exposed via
 * {@link createRuntime}'s return value.
 */
export interface AdapterLifecycle {
    /**
     * Idempotent one-time setup (connections, schema migrations,
     * authentication). Called automatically before the first adapter method
     * invocation — adapter implementers should never call this directly.
     * Rejects on persistent failures such as bad credentials or unreachable
     * hosts.
     */
    init: () => Promise<void>;

    /**
     * Release resources (connections, file handles, etc.). After `close()`,
     * all subsequent method calls will throw. Irreversible.
     */
    close: () => Promise<void>;
}

export interface CommonRuntimeAdapter extends AdapterLifecycle {
    apiVersion: "1";
    checkConnection: () => Promise<AdapterAPIResult<null>>;
}

export type RaurusDatabaseAdapterId = `${Lowercase<string>}-database-adapter`;
export type RaurusStorageAdapterId = `${Lowercase<string>}-storage-adapter`;

export interface RuntimeDatabaseAdapter extends CommonRuntimeAdapter {
    id: RaurusDatabaseAdapterId;

    /**
     * Get or create the type definition for a placeholder.
     * On first call for a given placeholderId, seeds the definition with the
     * provided type. On subsequent calls, validates that the type matches the
     * existing definition. Returns CONFLICT when the definition exists but the
     * type doesn't match — the caller (route handler) should reject the upsert
     * in that case.
     */
    getOrSeedPlaceholderDefinition: (
        placeholderId: string,
        type: RaurusMetadataType
    ) => Promise<AdapterAPIResult<null>>;

    upsertContentMetadata: (
        placeholderId: string,
        path: string,
        payload: RaurusMetadataPayload
    ) => Promise<AdapterAPIResult<null>>;

    listContentMetadataByPath: (path: string) => Promise<AdapterAPIResult<RaurusMetadataWithPath[]>>;
}

export interface RuntimeStorageAdapter extends CommonRuntimeAdapter {
    id: RaurusStorageAdapterId;

    createPresignedUploadUrl?: (assetKey: string) => Promise<AdapterAPIResult<{ url: string; headers?: Headers }>>;

    deleteAsset?: (assetKey: string) => Promise<AdapterAPIResult<null>>;
}

export type RuntimeDatabaseAdapterFactory<
    Config extends RuntimeDatabaseAdapterBaseConfig = RuntimeDatabaseAdapterBaseConfig,
> = (config?: Config) => RuntimeDatabaseAdapter;

export type RuntimeStorageAdapterFactory<
    Config extends RuntimeStorageAdapterBaseConfig = RuntimeStorageAdapterBaseConfig,
> = (config?: Config) => RuntimeStorageAdapter;
