import { injectCssPlugin } from "@bosh-code/tsdown-plugin-inject-css";
import { tailwindPlugin } from "@bosh-code/tsdown-plugin-tailwindcss";
import pluginBabel from "@rolldown/plugin-babel";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "tsdown";

export default defineConfig({
    dts: true,
    exports: true,
    minify: true,
    platform: "neutral",
    plugins: [
        pluginBabel({
            presets: [reactCompilerPreset()],
        }),
        injectCssPlugin(),
        tailwindPlugin(),
    ],
});
