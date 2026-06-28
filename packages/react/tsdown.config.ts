import { defineConfig } from "tsdown";

export default defineConfig({
    platform: "neutral",
    dts: true,
    exports: true,
    entry: ["src/index.ts"],
});
