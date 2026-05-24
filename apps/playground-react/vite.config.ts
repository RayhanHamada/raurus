import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { raurusPlaygroundPlugin } from "./server/plugin";

const packageSource = (path: string): string =>
    resolve(import.meta.dirname, path);

export default defineConfig({
    plugins: [react(), raurusPlaygroundPlugin()],
    resolve: {
        alias: {
            "@raurus/core": packageSource("../../packages/core/src/index.ts"),
            "@raurus/metadata-sqlite": packageSource(
                "../../packages/metadata-sqlite/src/index.ts"
            ),
            "@raurus/permissions-basic": packageSource(
                "../../packages/permissions-basic/src/index.ts"
            ),
            "@raurus/react": packageSource("../../packages/react/src/index.ts"),
            "@raurus/storage-local": packageSource(
                "../../packages/storage-local/src/index.ts"
            ),
        },
    },
});
