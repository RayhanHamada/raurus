import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { localStorageAdapter } from "../src";

describe(localStorageAdapter, () => {
    test("writes files and returns a public URL", async () => {
        const uploadDir = await mkdtemp(join(tmpdir(), "raurus-storage-"));
        const adapter = localStorageAdapter({
            publicBaseUrl: "/uploads",
            uploadDir,
        });

        const storedAsset = await adapter.upload(
            new File(["image"], "hero.webp", { type: "image/webp" })
        );

        const fileContents = await readFile(
            join(uploadDir, storedAsset.key),
            "utf-8"
        );

        expect(storedAsset.key.endsWith(".webp")).toBeTruthy();
        expect(storedAsset.url).toBe(`/uploads/${storedAsset.key}`);
        expect(fileContents).toBe("image");
    });

    test("deletes stored files by key", async () => {
        const uploadDir = await mkdtemp(join(tmpdir(), "raurus-storage-"));
        const adapter = localStorageAdapter({
            publicBaseUrl: "/uploads",
            uploadDir,
        });

        const storedAsset = await adapter.upload(
            new File(["image"], "hero.png", { type: "image/png" })
        );

        await adapter.delete(storedAsset.key);

        await expect(
            readFile(join(uploadDir, storedAsset.key))
        ).rejects.toBeDefined();
    });
});
