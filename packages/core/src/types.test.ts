import { describe, expectTypeOf, it } from "vitest";

import type {
    AdapterMethodResult,
    CommonRuntimeAdapter,
    PhotoMetadata,
    RaurusAsset,
    RaurusMetadata,
    RaurusMetadataType,
    RuntimeMetadataAdapter,
    RuntimeMetadataAdapterBaseConfig,
    RuntimeMetadataAdapterFactory,
    RuntimeStorageAdapter,
    RuntimeStorageAdapterBaseConfig,
    RuntimeStorageAdapterFactory,
    TextMetadata,
    VideoMetadata,
} from "./types";

const makeMetadataAdapter = (): RuntimeMetadataAdapter => null as unknown as RuntimeMetadataAdapter;
const makeStorageAdapter = (): RuntimeStorageAdapter => null as unknown as RuntimeStorageAdapter;

describe("domain types", () => {
    it("RaurusMetadataType is the union of photo, text, and video literals", () => {
        expectTypeOf<RaurusMetadataType>().toEqualTypeOf<PhotoMetadata | TextMetadata | VideoMetadata>();
        expectTypeOf<RaurusMetadataType>().toEqualTypeOf<"photo" | "text" | "video">();
    });

    it("RaurusAsset accepts ArrayBuffer, File, and Blob", () => {
        expectTypeOf<RaurusAsset>().toEqualTypeOf<ArrayBuffer | File | Blob>();
    });
});

describe("RaurusMetadata discriminated union", () => {
    it("photo variant carries assetKey and excludes text", () => {
        const photo: RaurusMetadata = { placeholderId: "p1", type: "photo", assetKey: "a1" };
        expectTypeOf(photo).toMatchTypeOf<RaurusMetadata>();
        expectTypeOf(photo.type).toEqualTypeOf<PhotoMetadata>();
        expectTypeOf(photo).toHaveProperty("assetKey");
        expectTypeOf(photo).not.toHaveProperty("text");
    });

    it("text variant carries text and excludes assetKey", () => {
        const text: RaurusMetadata = { placeholderId: "p2", type: "text", text: "hello" };
        expectTypeOf(text).toMatchTypeOf<RaurusMetadata>();
        expectTypeOf(text.type).toEqualTypeOf<TextMetadata>();
        expectTypeOf(text).toHaveProperty("text");
        expectTypeOf(text).not.toHaveProperty("assetKey");
    });

    it("video variant carries assetKey", () => {
        const video: RaurusMetadata = { placeholderId: "p3", type: "video", assetKey: "a3" };
        expectTypeOf(video).toMatchTypeOf<RaurusMetadata>();
        expectTypeOf(video.type).toEqualTypeOf<VideoMetadata>();
        expectTypeOf(video).toHaveProperty("assetKey");
        expectTypeOf(video).not.toHaveProperty("text");
    });

    it("narrows the photo branch to expose assetKey", () => {
        const meta: RaurusMetadata = { placeholderId: "p1", type: "photo", assetKey: "a1" };
        if (meta.type === "photo") {
            expectTypeOf(meta).toHaveProperty("assetKey");
            expectTypeOf(meta.type).toEqualTypeOf<PhotoMetadata>();
        }
    });

    it("narrows the text branch to expose text", () => {
        const meta: RaurusMetadata = { placeholderId: "p2", type: "text", text: "hello" };
        if (meta.type === "text") {
            expectTypeOf(meta).toHaveProperty("text");
            expectTypeOf(meta.type).toEqualTypeOf<TextMetadata>();
        }
    });

    it("narrows the video branch to expose assetKey", () => {
        const meta: RaurusMetadata = { placeholderId: "p3", type: "video", assetKey: "a3" };
        if (meta.type === "video") {
            expectTypeOf(meta).toHaveProperty("assetKey");
            expectTypeOf(meta.type).toEqualTypeOf<VideoMetadata>();
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
});

describe("common runtime adapter contract", () => {
    it("requires a checkConnection method returning a structured connection status", () => {
        expectTypeOf<CommonRuntimeAdapter["checkConnection"]>().toEqualTypeOf<
            () => Promise<AdapterMethodResult<null>>
        >();
    });
});

describe("metadata adapter contract", () => {
    it("uses a lowercase template literal id", () => {
        expectTypeOf<RuntimeMetadataAdapter["id"]>().toEqualTypeOf<`${Lowercase<string>}-metadata-adapter`>();
    });

    it("getMetadataByPlaceholderId returns AdapterMethodResult wrapping RaurusMetadata or null", () => {
        type GetOne = RuntimeMetadataAdapter["getMetadataByPlaceholderId"];
        expectTypeOf<Parameters<GetOne>>().toEqualTypeOf<[placeholderId: string]>();
        expectTypeOf<ReturnType<GetOne>>().toEqualTypeOf<Promise<AdapterMethodResult<RaurusMetadata | null>>>();
    });

    it("bulkGetMetadataByPlaceholderIds is optional", () => {
        type Bulk = RuntimeMetadataAdapter["bulkGetMetadataByPlaceholderIds"];
        expectTypeOf<Bulk>().toEqualTypeOf<
            ((placeholderIds: string[]) => Promise<AdapterMethodResult<RaurusMetadata[]>>) | undefined
        >();
    });

    it("upsertContentMetadata accepts photo/video with an assetKey", () => {
        type UpsertPhotoVideo = (
            placeholderId: string,
            type: PhotoMetadata | VideoMetadata,
            assetKey: string
        ) => Promise<AdapterMethodResult<null>>;
        expectTypeOf<UpsertPhotoVideo>().toBeFunction();
        expectTypeOf<Parameters<UpsertPhotoVideo>>().toEqualTypeOf<
            [placeholderId: string, type: PhotoMetadata | VideoMetadata, assetKey: string]
        >();
        expectTypeOf<ReturnType<UpsertPhotoVideo>>().toEqualTypeOf<Promise<AdapterMethodResult<null>>>();
    });

    it("upsertContentMetadata accepts text with a text payload", () => {
        type UpsertText = (
            placeholderId: string,
            type: TextMetadata,
            text: string
        ) => Promise<AdapterMethodResult<null>>;
        expectTypeOf<UpsertText>().toBeFunction();
        expectTypeOf<Parameters<UpsertText>>().toEqualTypeOf<
            [placeholderId: string, type: TextMetadata, text: string]
        >();
        expectTypeOf<ReturnType<UpsertText>>().toEqualTypeOf<Promise<AdapterMethodResult<null>>>();
    });
});

describe("storage adapter contract", () => {
    it("uses a lowercase template literal id", () => {
        expectTypeOf<RuntimeStorageAdapter["id"]>().toEqualTypeOf<`${Lowercase<string>}-storage-adapter`>();
    });

    it("createPresignedUploadUrl is optional", () => {
        type Presigned = RuntimeStorageAdapter["createPresignedUploadUrl"];
        expectTypeOf<Presigned>().toEqualTypeOf<
            ((assetKey: string, expiresIn?: number) => Promise<AdapterMethodResult<{ url: string }>>) | undefined
        >();
    });
});

describe("factory types", () => {
    it("RuntimeMetadataAdapterFactory returns a RuntimeMetadataAdapter when called with no arguments", () => {
        const factory: RuntimeMetadataAdapterFactory = () => makeMetadataAdapter();
        const adapter = factory();
        expectTypeOf(adapter).toEqualTypeOf<RuntimeMetadataAdapter>();
        const adapterWithConfig = factory({});
        expectTypeOf(adapterWithConfig).toEqualTypeOf<RuntimeMetadataAdapter>();
    });

    it("RuntimeMetadataAdapterFactory accepts a custom config type", () => {
        interface CustomMetadataConfig extends RuntimeMetadataAdapterBaseConfig {
            tableName: string;
        }
        const factory: RuntimeMetadataAdapterFactory<CustomMetadataConfig> = () => makeMetadataAdapter();
        const adapter = factory({ tableName: "items" });
        expectTypeOf(adapter).toEqualTypeOf<RuntimeMetadataAdapter>();
    });

    it("RuntimeStorageAdapterFactory returns a RuntimeStorageAdapter when called with no arguments", () => {
        const factory: RuntimeStorageAdapterFactory = () => makeStorageAdapter();
        const adapter = factory();
        expectTypeOf(adapter).toEqualTypeOf<RuntimeStorageAdapter>();
        const adapterWithConfig = factory({});
        expectTypeOf(adapterWithConfig).toEqualTypeOf<RuntimeStorageAdapter>();
    });

    it("RuntimeStorageAdapterFactory accepts a custom config type", () => {
        interface CustomStorageConfig extends RuntimeStorageAdapterBaseConfig {
            bucket: string;
        }
        const factory: RuntimeStorageAdapterFactory<CustomStorageConfig> = () => makeStorageAdapter();
        const adapter = factory({ bucket: "media" });
        expectTypeOf(adapter).toEqualTypeOf<RuntimeStorageAdapter>();
    });
});
