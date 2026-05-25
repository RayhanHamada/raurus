import { describe, expect, test, vi } from "vitest";

import type { IAssetRecord } from "../src";
import {
    createRaurusRuntime,
    DEFAULT_MAX_FILE_SIZE_BYTES,
    RaurusRuntimeError,
} from "../src";

const createFile = (
    options?: Partial<Pick<File, "name" | "size" | "type">>
): File => {
    const size = options?.size ?? 32;

    return new File([new Uint8Array(size)], options?.name ?? "hero.png", {
        type: options?.type ?? "image/png",
    });
};

const createStoredAsset = () => ({
    key: "asset-1.png",
    mimeType: "image/png",
    size: 32,
    url: "/uploads/asset-1.png",
});

const createRecord = (id: string): IAssetRecord => ({
    assetKey: "asset-1.png",
    id,
    mimeType: "image/png",
    updatedAt: "2026-05-24T00:00:00.000Z",
    url: "/uploads/asset-1.png",
});

const resolvedMock = <TArgs extends unknown[], TResult>(
    implementation: (...arguments_: TArgs) => TResult
) =>
    vi.fn<(...arguments_: TArgs) => Promise<TResult>>((...arguments_) =>
        Promise.resolve(implementation(...arguments_))
    );

const voidMock = <TArgs extends unknown[]>(
    implementation?: (...arguments_: TArgs) => void
) =>
    vi.fn<(...arguments_: TArgs) => Promise<void>>((...arguments_) => {
        implementation?.(...arguments_);
        return Promise.resolve();
    });

describe("@raurus/core createRaurusRuntime", () => {
    test("returns an existing asset record", async () => {
        const metadata = {
            get: resolvedMock<[string], IAssetRecord>(() =>
                createRecord("homepage.hero.banner")
            ),
            remove: voidMock<[string]>(),
            set: voidMock<[string, IAssetRecord]>(),
        };
        const runtime = createRaurusRuntime({
            metadata,
            permissions: { canEdit: resolvedMock<[], boolean>(() => true) },
            storage: {
                delete: voidMock<[string]>(),
                upload: resolvedMock<
                    [File],
                    ReturnType<typeof createStoredAsset>
                >(() => createStoredAsset()),
            },
        });

        await expect(
            runtime.getAsset("homepage.hero.banner")
        ).resolves.toStrictEqual(createRecord("homepage.hero.banner"));
    });

    test("returns null when an asset record is missing", async () => {
        const runtime = createRaurusRuntime({
            metadata: {
                get: resolvedMock<[string], IAssetRecord | null>(() => null),
                remove: voidMock<[string]>(),
                set: voidMock<[string, IAssetRecord]>(),
            },
            permissions: { canEdit: resolvedMock<[], boolean>(() => true) },
            storage: {
                delete: voidMock<[string]>(),
                upload: resolvedMock<
                    [File],
                    ReturnType<typeof createStoredAsset>
                >(() => createStoredAsset()),
            },
        });

        await expect(runtime.getAsset("missing.asset")).resolves.toBeNull();
    });

    test("resolves canEdit true and false", async () => {
        const canEdit = vi
            .fn<() => Promise<boolean>>()
            .mockResolvedValue(false)
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
        const runtime = createRaurusRuntime({
            metadata: {
                get: resolvedMock<[string], IAssetRecord | null>(() => null),
                remove: voidMock<[string]>(),
                set: voidMock<[string, IAssetRecord]>(),
            },
            permissions: { canEdit },
            storage: {
                delete: voidMock<[string]>(),
                upload: resolvedMock<
                    [File],
                    ReturnType<typeof createStoredAsset>
                >(() => createStoredAsset()),
            },
        });

        await expect(runtime.canEdit()).resolves.toBeFalsy();
        await expect(runtime.canEdit()).resolves.toBeTruthy();
    });

    test("rejects invalid MIME types", async () => {
        const runtime = createRaurusRuntime({
            metadata: {
                get: resolvedMock<[string], IAssetRecord | null>(() => null),
                remove: voidMock<[string]>(),
                set: voidMock<[string, IAssetRecord]>(),
            },
            permissions: { canEdit: resolvedMock<[], boolean>(() => true) },
            storage: {
                delete: voidMock<[string]>(),
                upload: resolvedMock<
                    [File],
                    ReturnType<typeof createStoredAsset>
                >(() => createStoredAsset()),
            },
        });

        await expect(
            runtime.replaceAsset(
                "homepage.hero.banner",
                createFile({ name: "hero.txt", type: "text/plain" })
            )
        ).rejects.toMatchObject({ code: "INVALID_MIME_TYPE" });
    });

    test("rejects oversized files", async () => {
        const runtime = createRaurusRuntime({
            metadata: {
                get: resolvedMock<[string], IAssetRecord | null>(() => null),
                remove: voidMock<[string]>(),
                set: voidMock<[string, IAssetRecord]>(),
            },
            permissions: { canEdit: resolvedMock<[], boolean>(() => true) },
            storage: {
                delete: voidMock<[string]>(),
                upload: resolvedMock<
                    [File],
                    ReturnType<typeof createStoredAsset>
                >(() => createStoredAsset()),
            },
            validation: {
                maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE_BYTES - 1,
            },
        });

        await expect(
            runtime.replaceAsset(
                "homepage.hero.banner",
                createFile({ size: DEFAULT_MAX_FILE_SIZE_BYTES })
            )
        ).rejects.toMatchObject({ code: "FILE_TOO_LARGE" });
    });

    test("replaces an asset successfully", async () => {
        const storage = {
            delete: voidMock<[string]>(),
            upload: resolvedMock<[File], ReturnType<typeof createStoredAsset>>(
                () => createStoredAsset()
            ),
        };
        const metadata = {
            get: resolvedMock<[string], IAssetRecord | null>(() => null),
            remove: voidMock<[string]>(),
            set: voidMock<[string, IAssetRecord]>(),
        };
        const runtime = createRaurusRuntime({
            metadata,
            permissions: { canEdit: resolvedMock<[], boolean>(() => true) },
            storage,
        });

        const file = createFile();
        const record = await runtime.replaceAsset("homepage.hero.banner", file);

        expect(storage.upload).toHaveBeenCalledWith(file);
        expect(metadata.set).toHaveBeenCalledWith(
            "homepage.hero.banner",
            expect.objectContaining({
                assetKey: "asset-1.png",
                id: "homepage.hero.banner",
                mimeType: "image/png",
                url: "/uploads/asset-1.png",
            })
        );
        expect(record.assetKey).toBe("asset-1.png");
    });

    test("cleans up uploads when metadata persistence fails", async () => {
        const storage = {
            delete: voidMock<[string]>(),
            upload: resolvedMock<[File], ReturnType<typeof createStoredAsset>>(
                () => createStoredAsset()
            ),
        };
        const runtime = createRaurusRuntime({
            metadata: {
                get: resolvedMock<[string], IAssetRecord | null>(() => null),
                remove: voidMock<[string]>(),
                set: vi.fn<(id: string, record: IAssetRecord) => Promise<void>>(
                    () => Promise.reject(new Error("db write failed"))
                ),
            },
            permissions: { canEdit: resolvedMock<[], boolean>(() => true) },
            storage,
        });

        await expect(
            runtime.replaceAsset("homepage.hero.banner", createFile())
        ).rejects.toMatchObject({ code: "METADATA_PERSISTENCE_FAILED" });
        expect(storage.delete).toHaveBeenCalledWith("asset-1.png");
    });

    test("removes an asset successfully", async () => {
        const metadata = {
            get: resolvedMock<[string], IAssetRecord | null>(() =>
                createRecord("homepage.hero.banner")
            ),
            remove: voidMock<[string]>(),
            set: voidMock<[string, IAssetRecord]>(),
        };
        const storage = {
            delete: voidMock<[string]>(),
            upload: resolvedMock<[File], ReturnType<typeof createStoredAsset>>(
                () => createStoredAsset()
            ),
        };
        const runtime = createRaurusRuntime({
            metadata,
            permissions: { canEdit: resolvedMock<[], boolean>(() => true) },
            storage,
        });

        await runtime.removeAsset("homepage.hero.banner");

        expect(metadata.remove).toHaveBeenCalledWith("homepage.hero.banner");
        expect(storage.delete).toHaveBeenCalledWith("asset-1.png");
    });

    test("throws a missing-asset error for absent removals", async () => {
        const runtime = createRaurusRuntime({
            metadata: {
                get: resolvedMock<[string], IAssetRecord | null>(() => null),
                remove: voidMock<[string]>(),
                set: voidMock<[string, IAssetRecord]>(),
            },
            permissions: { canEdit: resolvedMock<[], boolean>(() => true) },
            storage: {
                delete: voidMock<[string]>(),
                upload: resolvedMock<
                    [File],
                    ReturnType<typeof createStoredAsset>
                >(() => createStoredAsset()),
            },
        });

        await expect(
            runtime.removeAsset("missing.asset")
        ).rejects.toBeInstanceOf(RaurusRuntimeError);
        await expect(
            runtime.removeAsset("missing.asset")
        ).rejects.toMatchObject({
            code: "MISSING_ASSET",
        });
    });
});
