import type { Preview } from "@storybook/react-vite";

import { RaurusClientProvider } from "../src/components/client-provider";

import "../src/index.css";

const preview: Preview = {
    decorators: [
        (Story) => (
            <RaurusClientProvider url="https://example.com">
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
