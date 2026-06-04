import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

import oxignore from "./oxignore.json" with { type: "json" };

export default defineConfig({
    ...ultracite,
    ignorePatterns: [...oxignore],
    tabWidth: 4,
    printWidth: 120,
});
