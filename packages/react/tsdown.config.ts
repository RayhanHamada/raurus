import pluginBabel from "@rolldown/plugin-babel";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "tsdown";

export default defineConfig({
    clean: true,
    dts: true,
    platform: "neutral",
    plugins: [
        pluginBabel({
            presets: [reactCompilerPreset()],
        }),
    ],
});
