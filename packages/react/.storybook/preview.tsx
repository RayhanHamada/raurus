import type { Preview } from "@storybook/react-vite";
import { initialize, mswLoader } from "msw-storybook-addon";

import { RaurusClientProvider } from "../src/components/client-provider";
import { mswHandlers } from "./msw-handlers";

import "../src/index.css";

initialize({ onUnhandledRequest: "bypass" });

const preview: Preview = {
    decorators: [
        (Story) => (
            <RaurusClientProvider url="https://example.com">
                <Story />
            </RaurusClientProvider>
        ),
    ],
    loaders: [mswLoader],
    parameters: {
        msw: { handlers: mswHandlers },
        controls: {
            matchers: {
                color: /(?<color>background|color)$/iu,
                date: /Date$/iu,
            },
        },
    },
};

export default preview;
