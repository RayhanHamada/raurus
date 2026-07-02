import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { useRaurus } from "../hooks/useRaurus";
import { RaurusClientProvider } from "./client-provider";
import { EditableH1 } from "./editable-text";

function EditorStatus() {
    const ctx = useRaurus();
    return <span data-testid="edit-mode">{ctx.editMode ? "ON" : "OFF"}</span>;
}

const meta = {
    component: RaurusClientProvider,
    tags: ["ai-generated"],
} satisfies Meta<typeof RaurusClientProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultEditModeOff: Story = {
    args: { url: "https://example.com", children: <EditorStatus /> },
    play: async ({ canvas }) => {
        await expect(canvas.getByTestId("edit-mode")).toHaveTextContent("OFF");
    },
};

export const DefaultEditModeOn: Story = {
    args: { url: "https://example.com", editMode: true, children: <EditorStatus /> },
    play: async ({ canvas }) => {
        await expect(canvas.getByTestId("edit-mode")).toHaveTextContent("ON");
    },
};

export const WithEditableContent: Story = {
    args: {
        url: "https://example.com",
        editMode: false,
        children: <EditableH1 id="provider-story-h1">Provider Wrapped Heading</EditableH1>,
    },
};
