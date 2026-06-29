import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";
import vue from "ultracite/oxlint/vue";

import oxignore from "./oxignore.json" with { type: "json" };

export default defineConfig({
    extends: [core, react, vitest, vue, next],
    ignorePatterns: [...oxignore, "**/playground/**/*", "**/examples"],
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
        "jsx-a11y/media-has-caption": "off",
        "no-shadow": "off",
        "react/exhaustive-deps": "error",
    },
    overrides: [
        {
            files: ["packages/react/src/**/*.tsx"],
            rules: {
                "react/jsx-no-useless-fragment": "off",
                "nextjs/no-img-element": "off",
            },
        },
    ],
});
