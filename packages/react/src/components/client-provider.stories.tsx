import type { Meta, StoryObj } from "@storybook/react-vite";

import { useRaurus } from "../hooks/useRaurus";
import { EditableH1 } from "./editable-field";

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
        const { expect } = await import("storybook/test");
        await expect(canvas.getByTestId("edit-mode")).toHaveTextContent("OFF");
    },
};

export const DefaultEditModeOn: Story = {
    render: () => <EditorStatus />,
};

export const WithEditableContent: Story = {
    render: () => <EditableH1 id="provider-story-h1">Provider Wrapped Heading</EditableH1>,
    play: async ({ canvas }) => {
        const { expect } = await import("storybook/test");
        const heading = canvas.getByText("Provider Wrapped Heading");
        await expect(heading).toBeVisible();
    },
};
