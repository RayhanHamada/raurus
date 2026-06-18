import { defineConfig } from "tsdown";

export default defineConfig({
    dts: true,
    exports: true,
    minify: true,
    entry: ["src/index.ts"],
    platform: "node",
});
