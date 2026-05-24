import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Raurus",
    description: "Inline image editing without handing your UI to a CMS.",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "Home", link: "/" },
            { text: "API Examples", link: "/api-examples" },
            {
                text: "GitHub",
                link: "https://github.com/RayhanHamada/raurus",
            },
        ],

        sidebar: [
            {
                text: "Documentation",
                items: [
                    { text: "Runtime API Examples", link: "/api-examples" },
                    { text: "Markdown Examples", link: "/markdown-examples" },
                ],
            },
        ],

        socialLinks: [
            {
                icon: "github",
                link: "https://github.com/RayhanHamada/raurus",
            },
        ],
    },
});
