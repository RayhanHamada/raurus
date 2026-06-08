import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createOpenApiSpecification } from "itty-spec";
import { defineConfig } from "tsdown";

import { OPENAPI_CONFIG } from "@/config";
import { contract } from "@/contract";

export default defineConfig({
    dts: true,
    exports: true,
    entry: ["src/index.ts"],
    hooks: {
        async "build:before"() {
            const spec = await createOpenApiSpecification(contract, OPENAPI_CONFIG);
            const output = resolve(process.cwd(), "openapi.json");

            await writeFile(output, JSON.stringify(spec), "utf-8");

            console.log(`OpenAPI spec written to ${output}`);
        },
    },
});
