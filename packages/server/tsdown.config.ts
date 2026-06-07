// oxlint-disable promise/avoid-new
import { spawn } from "node:child_process";

import { defineConfig } from "tsdown";

async function generateOpenApiSpecification() {
    return new Promise<void>((resolve, reject) => {
        const child = spawn("bun", ["run", "src/generate-openapi.ts"], {
            cwd: process.cwd(),
            stdio: "inherit",
        });

        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`OpenAPI generation failed with exit code ${code ?? "unknown"}`));
        });
    });
}

export default defineConfig({
    dts: true,
    exports: true,
    entry: "src/index.ts",
    hooks: {
        async "build:before"() {
            await generateOpenApiSpecification();
        },
    },
});
