import { describe, expectTypeOf, it } from "vitest";

import type {
    AdapterMethodResult,
    CommonRuntimeAdapter,
    FailureCode,
    PhotoMetadataType,
    RaurusAsset,
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

    it("RaurusAsset is ArrayBuffer", () => {
        expectTypeOf<RaurusAsset>().toEqualTypeOf<ArrayBuffer>();
    });
});

describe("RaurusMetadata discriminated union", () => {
    it("photo variant carries assetKey and excludes text", () => {
        const photo: RaurusMetadata = { placeholderId: "p1", type: "photo", assetKey: "a1" };
        expectTypeOf(photo).toMatchTypeOf<RaurusMetadata>();
        expectTypeOf(photo.type).toEqualTypeOf<PhotoMetadataType>();
        expectTypeOf(photo).toHaveProperty("assetKey");
        expectTypeOf(photo).not.toHaveProperty("text");
    });

    it("text variant carries text and excludes assetKey", () => {
        const text: RaurusMetadata = { placeholderId: "p2", type: "text", text: "hello" };
        expectTypeOf(text).toMatchTypeOf<RaurusMetadata>();
        expectTypeOf(text.type).toEqualTypeOf<TextMetadataType>();
        expectTypeOf(text).toHaveProperty("text");
        expectTypeOf(text).not.toHaveProperty("assetKey");
    });

    it("video variant carries assetKey", () => {
        const video: RaurusMetadata = { placeholderId: "p3", type: "video", assetKey: "a3" };
        expectTypeOf(video).toMatchTypeOf<RaurusMetadata>();
        expectTypeOf(video.type).toEqualTypeOf<VideoMetadataType>();
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
        const success: AdapterMethodResult<number> = { ok: true, data: 1 };
        const failure: AdapterMethodResult<number> = { ok: false, error: new Error("boom") };
        expectTypeOf(success).toMatchTypeOf<AdapterMethodResult<number>>();
        expectTypeOf(failure).toMatchTypeOf<AdapterMethodResult<number>>();
        if (success.ok) {
            expectTypeOf(success.data).toEqualTypeOf<number>();
        }
    });

    it("Failure branch exposes an Error on the error key", () => {
        const result: AdapterMethodResult<number> = { ok: false, error: new Error("boom") };
        if (!result.ok) {
            expectTypeOf(result.error).toEqualTypeOf<Error>();
        }
    });

    it("Failure branch carries an optional FailureCode on the code key", () => {
        const result: AdapterMethodResult<number> = { ok: false, error: new Error("boom"), code: "NOT_FOUND" };
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
        expectTypeOf<CommonRuntimeAdapter["checkConnection"]>().toEqualTypeOf<
            () => Promise<AdapterMethodResult<null>>
        >();
    });
});

describe("metadata adapter contract", () => {
    it("uses a lowercase template literal id", () => {
        expectTypeOf<RuntimeDatabaseAdapter["id"]>().toEqualTypeOf<`${Lowercase<string>}-database-adapter`>();
    });

    it("getMetadataByPlaceholderId returns AdapterMethodResult wrapping RaurusMetadata or null", () => {
        type GetOne = RuntimeDatabaseAdapter["getMetadata"];
        expectTypeOf<Parameters<GetOne>>().toEqualTypeOf<[placeholderId: string]>();
        expectTypeOf<ReturnType<GetOne>>().toEqualTypeOf<Promise<AdapterMethodResult<RaurusMetadata | null>>>();
    });

    it("bulkGetMetadataByPlaceholderIds is required", () => {
        type Bulk = RuntimeDatabaseAdapter["bulkGetMetadataByPlaceholderIds"];
        expectTypeOf<Bulk>().toEqualTypeOf<
            (placeholderIds: string[]) => Promise<AdapterMethodResult<RaurusMetadata[]>>
        >();
    });

    it("upsertContentMetadata accepts photo/video with an assetKey", () => {
        type UpsertPhotoVideo = (
            placeholderId: string,
            type: PhotoMetadataType | VideoMetadataType,
            assetKey: string
        ) => Promise<AdapterMethodResult<null>>;
        expectTypeOf<UpsertPhotoVideo>().toBeFunction();
        expectTypeOf<Parameters<UpsertPhotoVideo>>().toEqualTypeOf<
            [placeholderId: string, type: PhotoMetadataType | VideoMetadataType, assetKey: string]
        >();
        expectTypeOf<ReturnType<UpsertPhotoVideo>>().toEqualTypeOf<Promise<AdapterMethodResult<null>>>();
    });

    it("upsertContentMetadata accepts text with a text payload", () => {
        type UpsertText = (
            placeholderId: string,
            type: TextMetadataType,
            text: string
        ) => Promise<AdapterMethodResult<null>>;
        expectTypeOf<UpsertText>().toBeFunction();
        expectTypeOf<Parameters<UpsertText>>().toEqualTypeOf<
            [placeholderId: string, type: TextMetadataType, text: string]
        >();
        expectTypeOf<ReturnType<UpsertText>>().toEqualTypeOf<Promise<AdapterMethodResult<null>>>();
    });
});

describe("storage adapter contract", () => {
    it("uses a lowercase template literal id", () => {
        expectTypeOf<RuntimeStorageAdapter["id"]>().toEqualTypeOf<`${Lowercase<string>}-storage-adapter`>();
    });

    it("uploadAsset is optional and accepts an ArrayBuffer payload", () => {
        type Upload = RuntimeStorageAdapter["uploadAsset"];
        expectTypeOf<Upload>().toEqualTypeOf<
            ((assetKey: string, asset: ArrayBuffer) => Promise<AdapterMethodResult<{ assetKey: string }>>) | undefined
        >();
    });

    it("createPresignedUploadUrl is optional", () => {
        type Presigned = RuntimeStorageAdapter["createPresignedUploadUrl"];
        expectTypeOf<Presigned>().toEqualTypeOf<
            ((assetKey: string, expiresIn?: number) => Promise<AdapterMethodResult<{ url: string }>>) | undefined
        >();
    });

    it("createPresignedDownloadUrl is optional and mirrors createPresignedUploadUrl", () => {
        type Presigned = RuntimeStorageAdapter["createPresignedDownloadUrl"];
        expectTypeOf<Presigned>().toEqualTypeOf<
            ((assetKey: string, expiresIn?: number) => Promise<AdapterMethodResult<{ url: string }>>) | undefined
        >();
    });

    it("deleteAsset is optional", () => {
        type Delete = RuntimeStorageAdapter["deleteAsset"];
        expectTypeOf<Delete>().toEqualTypeOf<((assetKey: string) => Promise<AdapterMethodResult<null>>) | undefined>();
    });

    it("getAssetContent is optional and returns data with a content type", () => {
        type GetContent = RuntimeStorageAdapter["getAssetContent"];
        expectTypeOf<GetContent>().toEqualTypeOf<
            ((assetKey: string) => Promise<AdapterMethodResult<{ data: ArrayBuffer; contentType: string }>>) | undefined
        >();
    });
});

describe("factory types", () => {
    it("RuntimeMetadataAdapterFactory returns a RuntimeMetadataAdapter when called with no arguments", () => {
        const factory: RuntimeDatabaseAdapterFactory = () => makeMetadataAdapter();
        const adapter = factory();
        expectTypeOf(adapter).toMatchTypeOf<RuntimeDatabaseAdapter>();
        const adapterWithConfig = factory({});
        expectTypeOf(adapterWithConfig).toMatchTypeOf<RuntimeDatabaseAdapter>();
    });

    it("RuntimeMetadataAdapterFactory accepts a custom config type", () => {
        interface CustomMetadataConfig extends RuntimeDatabaseAdapterBaseConfig {
            tableName: string;
        }
        const factory: RuntimeDatabaseAdapterFactory<CustomMetadataConfig> = () => makeMetadataAdapter();
        const adapter = factory({ tableName: "items" });
        expectTypeOf(adapter).toMatchTypeOf<RuntimeDatabaseAdapter>();
    });

    it("RuntimeStorageAdapterFactory returns a RuntimeStorageAdapter when called with no arguments", () => {
        const factory: RuntimeStorageAdapterFactory = () => makeStorageAdapter();
        const adapter = factory();
        expectTypeOf(adapter).toMatchTypeOf<RuntimeStorageAdapter>();
        const adapterWithConfig = factory({});
        expectTypeOf(adapterWithConfig).toMatchTypeOf<RuntimeStorageAdapter>();
    });

    it("RuntimeStorageAdapterFactory accepts a custom config type", () => {
        interface CustomStorageConfig extends RuntimeStorageAdapterBaseConfig {
            bucket: string;
        }
        const factory: RuntimeStorageAdapterFactory<CustomStorageConfig> = () => makeStorageAdapter();
        const adapter = factory({ bucket: "media" });
        expectTypeOf(adapter).toMatchTypeOf<RuntimeStorageAdapter>();
    });


});
