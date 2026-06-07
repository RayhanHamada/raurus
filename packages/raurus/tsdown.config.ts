import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createOpenApiSpecification } from "itty-spec";
import { defineConfig } from "tsdown";

import { openapiConfig } from "./src/server/config.ts";
import { contract } from "./src/server/contract.ts";

export default defineConfig({
    dts: true,
    exports: true,
    entry: ["src/*/index.ts"],
    platform: "neutral",
    hooks: {
        async "build:before"() {
            const spec = await createOpenApiSpecification(contract, openapiConfig);

            const output = resolve(process.cwd(), "src/server/openapi.json");
            await writeFile(output, JSON.stringify(spec), "utf-8");

            console.log(`OpenAPI spec written to ${output}`);
        },
    },
});
