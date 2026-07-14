import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { useRaurus } from "../hooks/useRaurus";
import { $editMode } from "../state";
import { EditableH1 } from "./editable-text";

function EditorStatus() {
    const ctx = useRaurus();
    return <span data-testid="edit-mode">{ctx.editMode ? "ON" : "OFF"}</span>;
}

const meta = {
    component: EditorStatus,
    tags: ["ai-generated"],
} satisfies Meta<typeof EditorStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultEditModeOff: Story = {
    render: () => <EditorStatus />,
    play: async ({ canvas }) => {
        await expect(canvas.getByTestId("edit-mode")).toHaveTextContent("OFF");
    },
};

export const DefaultEditModeOn: Story = {
    render: () => <EditorStatus />,
    play: async ({ canvas }) => {
        $editMode.set(true);
        await waitFor(async () => {
            await expect(canvas.getByTestId("edit-mode")).toHaveTextContent("ON");
        });
    },
};

export const WithEditableContent: Story = {
    render: () => <EditableH1 id="provider-story-h1">Provider Wrapped Heading</EditableH1>,
    play: async ({ canvas }) => {
        const heading = canvas.getByText("Provider Wrapped Heading");
        await expect(heading).toBeVisible();
    },
};
