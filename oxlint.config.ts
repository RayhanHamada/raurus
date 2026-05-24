import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";
import vue from "ultracite/oxlint/vue";

import oxignore from "./oxignore.json" with { type: "json" };

export default defineConfig({
    extends: [core, react, vitest, vue],
    ignorePatterns: [...oxignore],
    rules: {
        "func-style": ["off"],
        "sort-keys": "off",
        "unicorn/filename-case": ["off"],
        "vitest/require-top-level-describe": "off",
        "no-inline-comments": "off",
        "ban-ts-comment": "off",
    },
});
