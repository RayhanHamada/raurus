import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
// https://vitepress.dev/guide/custom-theme
import { h } from "vue";

// @ts-expect-error
import "./style.css";

export default {
    extends: DefaultTheme,
    Layout: () =>
        h(DefaultTheme.Layout, null, {
            // https://vitepress.dev/guide/extending-default-theme#layout-slots
        }),
    enhanceApp() {
        // ...
    },
} satisfies Theme;
