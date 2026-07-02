import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { RaurusClientProvider } from "./client-provider";
import { EditableH1, EditableDiv, EditableSpan } from "./editable-text";

const meta = {
    component: EditableH1,
    tags: ["ai-generated"],
} satisfies Meta<typeof EditableH1>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
    args: { id: "story-h1", children: "Welcome to Raurus" },
    play: async ({ canvas }) => {
        const heading = canvas.getByRole("heading", { name: /welcome to raurus/iu });
        await expect(heading).toBeVisible();
    },
};

export const H1EditMode: Story = {
    args: { id: "story-h1-edit", children: "Edit this heading" },
    render: (args) => (
        <RaurusClientProvider url="https://example.com" defaultEditMode>
            <EditableH1 {...args} />
        </RaurusClientProvider>
    ),
};

export const Div: Story = {
    args: { id: "story-div", children: "Some block content here" },
    render: (args) => <EditableDiv {...args} />,
};

export const Span: Story = {
    args: { id: "story-span", children: "Inline text content" },
    render: (args) => <EditableSpan {...args} />,
};

export const CssCheck: Story = {
    args: {
        id: "css-check-title",
        className: "raurus:text-red-500",
        children: "CssCheck",
    },
    render: (args) => <EditableH1 {...args} />,
    play: async ({ canvas }) => {
        const heading = canvas.getByRole("heading", { name: /csscheck/iu });
        await expect(getComputedStyle(heading).color).toBe("oklch(0.637 0.237 25.331)");
    },
};
