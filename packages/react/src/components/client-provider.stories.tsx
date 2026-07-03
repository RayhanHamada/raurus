import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect } from "react";
import { expect } from "storybook/test";

import { useRaurus } from "../hooks/useRaurus";
import { $editMode } from "../state";
import { EditableH1 } from "./editable-text";

function EditorStatus() {
    const ctx = useRaurus();
    return <span data-testid="edit-mode">{ctx.editMode ? "ON" : "OFF"}</span>;
}

function EditModeOn({ children }: { children: React.ReactNode }) {
    useLayoutEffect(() => {
        $editMode.set(true);
        return () => $editMode.set(false);
    }, []);
    return <>{children}</>;
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
    decorators: [
        (Story) => (
            <EditModeOn>
                <Story />
            </EditModeOn>
        ),
    ],
    play: async ({ canvas }) => {
        await expect(canvas.getByTestId("edit-mode")).toHaveTextContent("ON");
    },
};

export const WithEditableContent: Story = {
    render: () => <EditableH1 id="provider-story-h1">Provider Wrapped Heading</EditableH1>,
    play: async ({ canvas }) => {
        const heading = canvas.getByText("Provider Wrapped Heading");
        await expect(heading).toBeVisible();
    },
};
