import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

import oxignore from "./oxignore.json" with { type: "json" };

export default defineConfig({
    extends: [core, react, vitest],
    ignorePatterns: [...oxignore],
    rules: {
        "func-style": ["off"],
        "unicorn/filename-case": ["off"],
        "vitest/require-top-level-describe": "off",
    },
});
