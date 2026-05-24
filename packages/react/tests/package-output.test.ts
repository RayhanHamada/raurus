// @vitest-environment node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const packageDirectory = resolve(import.meta.dirname, "..");

interface PackResult {
    files: {
        path: string;
    }[];
}

describe("@raurus/react package output", () => {
    test("ships the packaged stylesheet artifact", () => {
        const output = execFileSync("npm", ["pack", "--json", "--dry-run"], {
            cwd: packageDirectory,
            encoding: "utf-8",
        });
        const [packResult] = JSON.parse(output) as PackResult[];
        const packedFiles = packResult?.files.map(({ path }) => path);

        expect(packedFiles).toContain("dist/index.d.ts");
        expect(packedFiles).toContain("dist/index.js");
        expect(packedFiles).toContain("dist/styles.css");
    });

    test("exports the packaged stylesheet entry", () => {
        const packageJson = JSON.parse(
            readFileSync(resolve(packageDirectory, "package.json"), "utf-8")
        ) as {
            exports: Record<string, string>;
        };

        expect(packageJson.exports["./styles.css"]).toBe("./dist/styles.css");
    });
});
