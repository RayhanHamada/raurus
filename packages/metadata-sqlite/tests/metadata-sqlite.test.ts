import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { sqliteMetadataAdapter } from "../src";

describe(sqliteMetadataAdapter, () => {
    test("initializes the table and supports get, set, remove", async () => {
        const directory = await mkdtemp(join(tmpdir(), "raurus-db-"));
        const adapter = sqliteMetadataAdapter({
            dbPath: join(directory, "raurus.db"),
        });

        await adapter.set("homepage.hero.banner", {
            assetKey: "hero.png",
            id: "homepage.hero.banner",
            mimeType: "image/png",
            updatedAt: "2026-05-24T00:00:00.000Z",
            url: "/uploads/hero.png",
        });

        await expect(
            adapter.get("homepage.hero.banner")
        ).resolves.toStrictEqual({
            assetKey: "hero.png",
            id: "homepage.hero.banner",
            mimeType: "image/png",
            updatedAt: "2026-05-24T00:00:00.000Z",
            url: "/uploads/hero.png",
        });

        await adapter.remove("homepage.hero.banner");

        await expect(adapter.get("homepage.hero.banner")).resolves.toBeNull();
    });
});
