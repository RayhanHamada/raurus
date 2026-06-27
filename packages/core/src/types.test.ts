import { describe, expectTypeOf, it } from "vitest";

import type {
    AdapterAPIResult,
    CommonRuntimeAdapter,
    FailureCode,
    PhotoMetadataType,
    RaurusMetadata,
    RaurusMetadataType,
    RuntimeDatabaseAdapter,
    RuntimeDatabaseAdapterBaseConfig,
    RuntimeDatabaseAdapterFactory,
    RuntimeStorageAdapter,
    RuntimeStorageAdapterBaseConfig,
    RuntimeStorageAdapterFactory,
    TextMetadataType,
    VideoMetadataType,
} from "./types";

const makeMetadataAdapter = (): RuntimeDatabaseAdapter => null as unknown as RuntimeDatabaseAdapter;
const makeStorageAdapter = (): RuntimeStorageAdapter => null as unknown as RuntimeStorageAdapter;

describe("domain types", () => {
    it("RaurusMetadataType is the union of photo, text, and video literals", () => {
        expectTypeOf<RaurusMetadataType>().toEqualTypeOf<PhotoMetadataType | TextMetadataType | VideoMetadataType>();
        expectTypeOf<RaurusMetadataType>().toEqualTypeOf<"photo" | "text" | "video">();
    });
});

describe("RaurusMetadata discriminated union", () => {
    it("photo variant carries assetKey and excludes text", () => {
        const photo: RaurusMetadata = { placeholderId: "p1", type: "photo", assetKey: "a1" };
        expectTypeOf(photo).toExtend<RaurusMetadata>();
        expectTypeOf(photo.type).toEqualTypeOf<PhotoMetadataType | VideoMetadataType>();
        expectTypeOf(photo).toHaveProperty("assetKey");
        expectTypeOf(photo).not.toHaveProperty("text");
    });

    it("text variant carries text and excludes assetKey", () => {
        const text: RaurusMetadata = { placeholderId: "p2", type: "text", text: "hello" };
        expectTypeOf(text).toExtend<RaurusMetadata>();
        expectTypeOf(text.type).toEqualTypeOf<TextMetadataType>();
        expectTypeOf(text).toHaveProperty("text");
        expectTypeOf(text).not.toHaveProperty("assetKey");
    });

    it("video variant carries assetKey", () => {
        const video: RaurusMetadata = { placeholderId: "p3", type: "video", assetKey: "a3" };
        expectTypeOf(video).toExtend<RaurusMetadata>();
        expectTypeOf(video.type).toEqualTypeOf<PhotoMetadataType | VideoMetadataType>();
        expectTypeOf(video).toHaveProperty("assetKey");
        expectTypeOf(video).not.toHaveProperty("text");
    });

    it("narrows the photo branch to expose assetKey", () => {
        const meta: RaurusMetadata = { placeholderId: "p1", type: "photo", assetKey: "a1" };
        if (meta.type === "photo") {
            expectTypeOf(meta).toHaveProperty("assetKey");
            expectTypeOf(meta.type).toEqualTypeOf<PhotoMetadataType>();
        }
    });

    it("narrows the text branch to expose text", () => {
        const meta: RaurusMetadata = { placeholderId: "p2", type: "text", text: "hello" };
        if (meta.type === "text") {
            expectTypeOf(meta).toHaveProperty("text");
            expectTypeOf(meta.type).toEqualTypeOf<TextMetadataType>();
        }
    });

    it("narrows the video branch to expose assetKey", () => {
        const meta: RaurusMetadata = { placeholderId: "p3", type: "video", assetKey: "a3" };
        if (meta.type === "video") {
            expectTypeOf(meta).toHaveProperty("assetKey");
            expectTypeOf(meta.type).toEqualTypeOf<VideoMetadataType>();
        }
    });
});

describe("adapter result type", () => {
    it("discriminates on ok with Success<T> and Failure branches", () => {
        const success: AdapterAPIResult<number> = { ok: true, data: 1 };
        const failure: AdapterAPIResult<number> = { ok: false, error: new Error("boom") };
        expectTypeOf(success).toExtend<AdapterAPIResult<number>>();
        expectTypeOf(failure).toExtend<AdapterAPIResult<number>>();
        if (success.ok) {
            expectTypeOf(success.data).toEqualTypeOf<number>();
        }
    });

    it("Failure branch exposes an Error on the error key", () => {
        const result: AdapterAPIResult<number> = { ok: false, error: new Error("boom") };
        if (!result.ok) {
            expectTypeOf(result.error).toEqualTypeOf<Error>();
        }
    });

    it("Failure branch carries an optional FailureCode on the code key", () => {
        const result: AdapterAPIResult<number> = { ok: false, error: new Error("boom"), code: "NOT_FOUND" };
        if (!result.ok) {
            expectTypeOf(result.code).toEqualTypeOf<FailureCode | undefined>();
        }
    });

    it("FailureCode enumerates the documented failure categories", () => {
        expectTypeOf<FailureCode>().toEqualTypeOf<
            | "NOT_IMPLEMENTED"
            | "NOT_FOUND"
            | "CONFLICT"
            | "CONFIGURATION"
            | "CONNECTION"
            | "PERMISSION"
            | "RATE_LIMIT"
            | "UPSTREAM"
            | "INVALID_INPUT"
            | "UNKNOWN"
        >();
    });
});

describe("common runtime adapter contract", () => {
    it("declares apiVersion as the string literal '1'", () => {
        expectTypeOf<CommonRuntimeAdapter["apiVersion"]>().toEqualTypeOf<"1">();
    });

    it("requires a checkConnection method returning a structured connection status", () => {
        expectTypeOf<CommonRuntimeAdapter["checkConnection"]>().toEqualTypeOf<() => Promise<AdapterAPIResult<null>>>();
    });
});

describe("metadata adapter contract", () => {
    it("uses a lowercase template literal id", () => {
        expectTypeOf<RuntimeDatabaseAdapter["id"]>().toEqualTypeOf<`${Lowercase<string>}-database-adapter`>();
    });

    it("upsertContentMetadata accepts photo/video with a payload object containing assetKey", () => {
        type UpsertPhotoVideo = Parameters<RuntimeDatabaseAdapter["upsertContentMetadata"]>;
        expectTypeOf<UpsertPhotoVideo>().toEqualTypeOf<
            [
                path: string,
                placeholderId: string,
                payload:
                    | {
                          type: PhotoMetadataType | VideoMetadataType;
                          assetKey: string;
                      }
                    | {
                          type: TextMetadataType;
                          text: string;
                      },
            ]
        >();
    });

    it("upsertContentMetadata returns AdapterAPIResult<null>", () => {
        type UpsertReturn = ReturnType<RuntimeDatabaseAdapter["upsertContentMetadata"]>;
        expectTypeOf<UpsertReturn>().toEqualTypeOf<Promise<AdapterAPIResult<null>>>();
    });
});

describe("storage adapter contract", () => {
    it("uses a lowercase template literal id", () => {
        expectTypeOf<RuntimeStorageAdapter["id"]>().toEqualTypeOf<`${Lowercase<string>}-storage-adapter`>();
    });

    it("createPresignedUploadUrl is optional", () => {
        type Presigned = RuntimeStorageAdapter["createPresignedUploadUrl"];
        expectTypeOf<Presigned>().toEqualTypeOf<
            ((assetKey: string) => Promise<AdapterAPIResult<{ url: string; headers?: Headers }>>) | undefined
        >();
    });

    it("deleteAsset is optional", () => {
        type Delete = RuntimeStorageAdapter["deleteAsset"];
        expectTypeOf<Delete>().toEqualTypeOf<((assetKey: string) => Promise<AdapterAPIResult<null>>) | undefined>();
    });
});

describe("factory types", () => {
    it("RuntimeDatabaseAdapterFactory returns a RuntimeDatabaseAdapter when called with no arguments", () => {
        const factory: RuntimeDatabaseAdapterFactory = () => makeMetadataAdapter();
        const adapter = factory();
        expectTypeOf(adapter).toExtend<RuntimeDatabaseAdapter>();
        const adapterWithConfig = factory({});
        expectTypeOf(adapterWithConfig).toExtend<RuntimeDatabaseAdapter>();
    });

    it("RuntimeDatabaseAdapterFactory accepts a custom config type", () => {
        interface CustomMetadataConfig extends RuntimeDatabaseAdapterBaseConfig {
            tableName: string;
        }
        const factory: RuntimeDatabaseAdapterFactory<CustomMetadataConfig> = () => makeMetadataAdapter();
        const adapter = factory({ tableName: "items" });
        expectTypeOf(adapter).toExtend<RuntimeDatabaseAdapter>();
    });

    it("RuntimeStorageAdapterFactory returns a RuntimeStorageAdapter when called with no arguments", () => {
        const factory: RuntimeStorageAdapterFactory = () => makeStorageAdapter();
        const adapter = factory();
        expectTypeOf(adapter).toExtend<RuntimeStorageAdapter>();
        const adapterWithConfig = factory({});
        expectTypeOf(adapterWithConfig).toExtend<RuntimeStorageAdapter>();
    });

    it("RuntimeStorageAdapterFactory accepts a custom config type", () => {
        interface CustomStorageConfig extends RuntimeStorageAdapterBaseConfig {
            bucket: string;
        }
        const factory: RuntimeStorageAdapterFactory<CustomStorageConfig> = () => makeStorageAdapter();
        const adapter = factory({ bucket: "media" });
        expectTypeOf(adapter).toExtend<RuntimeStorageAdapter>();
    });
});
