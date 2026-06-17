import { defineConfig } from "tsdown";

export default defineConfig({
    dts: true,
    exports: true,
    entry: ["src/index.ts"],
    platform: "neutral",
    hooks: {
        async "build:before"() {
            await import("./typegen");
        },
    },
});
