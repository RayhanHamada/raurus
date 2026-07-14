import { defineConfig } from "tsdown";

export default defineConfig([
    {
        dts: true,
        exports: true,
        minify: true,
        entry: ["src/index.ts", "src/core/index.ts", "src/runtime/index.ts", "src/adapters/*/{index.ts,*/index.ts}"],
    },
]);
