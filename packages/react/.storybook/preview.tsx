import type { Preview } from "@storybook/react-vite";

import { RaurusClientProvider } from "../src/components/client-provider";

import "../src/index.css";

const preview: Preview = {
    globalTypes: {
        editMode: {
            name: "Edit Mode",
            description: "Toggle visual editing mode",
            defaultValue: "false",
            toolbar: {
                icon: "edit",
                items: [
                    { value: "false", icon: "eye", title: "View Mode" },
                    { value: "true", icon: "edit", title: "Edit Mode" },
                ],
                dynamicTitle: true,
            },
        },
    },
    decorators: [
        (Story, { globals }) => (
            <RaurusClientProvider url="https://example.com" enableEdit={globals.editMode === "true"}>
                <Story />
            </RaurusClientProvider>
        ),
    ],
    parameters: {
        controls: {
            matchers: {
                color: /(?<color>background|color)$/iu,
                date: /Date$/iu,
            },
        },
    },
};

export default preview;
