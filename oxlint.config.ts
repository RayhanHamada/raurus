import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";
import vue from "ultracite/oxlint/vue";

import oxignore from "./oxignore.json" with { type: "json" };

export default defineConfig({
    extends: [core, react, vitest, vue, next],
    jsPlugins: ["oxlint-tailwindcss"],
    ignorePatterns: [...oxignore],
    rules: {
        "func-style": ["off"],
        "sort-keys": "off",
        "unicorn/filename-case": ["off"],
        "vitest/require-top-level-describe": "off",
        "no-inline-comments": "off",
        "ban-ts-comment": "off",
        "typescript/no-empty-interface": "off",
        "typescript/no-empty-object-type": "off",
        "require-await": "off",

        "tailwindcss/enforce-canonical": "error",
        "tailwindcss/enforce-sort-order": "error",
    },
});
