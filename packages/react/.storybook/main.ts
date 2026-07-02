import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
const __dirname = import.meta.dirname;

function getAbsolutePath(value: string) {
    return path.dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
    stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        getAbsolutePath("@chromatic-com/storybook"),
        getAbsolutePath("@storybook/addon-vitest"),
        getAbsolutePath("@storybook/addon-mcp"),
    ],
    framework: getAbsolutePath("@storybook/react-vite"),
    staticDirs: ["../public"],
    async viteFinal(config) {
        config.resolve ??= {};
        config.resolve.alias ??= {
            "@": path.resolve(__dirname, "../src"),
        };
        config.plugins ??= [];
        config.plugins.push(tailwindcss());
        return config;
    },
};
export default config;
