import { injectCssPlugin } from "@bosh-code/tsdown-plugin-inject-css";
import { tailwindPlugin } from "@bosh-code/tsdown-plugin-tailwindcss";
import { defineConfig } from "tsdown";

export default defineConfig({
    platform: "neutral",
    dts: true,
    exports: true,
    css: {
        transformer: "postcss",
    },
    entry: ["./src/client.ts", "./src/server.ts"],
    plugins: [tailwindPlugin(), injectCssPlugin()],
    deps: {
        neverBundle: ["react", "react-dom"],
    },
});
