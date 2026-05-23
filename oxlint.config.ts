import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
    extends: [core, react, vitest],
    rules: {
        "func-style": ["off"],
        "unicorn/filename-case": ["off"],
        "vitest/require-top-level-describe": "off",
    },
});
