import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { RaurusClientProvider } from "@/components";

import {
    EditableDiv,
    EditableH1,
    EditableH2,
    EditableH3,
    EditableH4,
    EditableH5,
    EditableH6,
    EditableLink,
    EditableP,
    EditableSpan,
} from "./editable-text";

const meta = {
    component: EditableH1,
    tags: ["ai-generated"],
    decorators: [
        (Story) => (
            <RaurusClientProvider url="https://example.com" enableEdit>
                <Story />
            </RaurusClientProvider>
        ),
    ],
} satisfies Meta<typeof EditableH1>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
    args: { id: "story-h1" },
    render: (args) => <EditableH1 {...args}>Welcome to Raurus</EditableH1>,
    play: async ({ canvas }) => {
        const heading = canvas.getByRole("heading", { name: /welcome to raurus/iu });
        await expect(heading).toBeVisible();
    },
};

export const H2: Story = {
    args: { id: "story-h2" },
    render: (args) => <EditableH2 {...args}>Section Heading</EditableH2>,
};

export const H3: Story = {
    args: { id: "story-h3" },
    render: (args) => <EditableH3 {...args}>Subsection</EditableH3>,
};

export const H4: Story = {
    args: { id: "story-h4" },
    render: (args) => <EditableH4 {...args}>Smaller Heading</EditableH4>,
};

export const H5: Story = {
    args: { id: "story-h5" },
    render: (args) => <EditableH5 {...args}>Even Smaller</EditableH5>,
};

export const H6: Story = {
    args: { id: "story-h6" },
    render: (args) => <EditableH6 {...args}>Tiny Heading</EditableH6>,
};

export const Div: Story = {
    args: { id: "story-div" },
    render: (args) => (
        <>
            <EditableDiv {...args}>Some block content here</EditableDiv>
            <br />
            <EditableDiv id="story2-div">Another editable div</EditableDiv>
        </>
    ),
};

export const P: Story = {
    args: { id: "story-p" },
    render: (args) => (
        <EditableP {...args}>A paragraph of editable text. Click to select, click again to edit.</EditableP>
    ),
};

export const Span: Story = {
    args: { id: "story-span" },
    render: (args) => <EditableSpan {...args}>Inline text content</EditableSpan>,
};

export const Link: Story = {
    args: { id: "story-link" },
    render: ({ id }) => (
        <EditableLink id={id} href="https://example.com">
            Clickable link
        </EditableLink>
    ),
};

export const MultipleHeadings: Story = {
    args: { id: "multi-h1" },
    render: (args) => (
        <>
            <EditableH1 {...args}>Title</EditableH1>
            <EditableH2 id="multi-h2">Chapter</EditableH2>
            <EditableH3 id="multi-h3">Section</EditableH3>
        </>
    ),
};

export const CssCheck: Story = {
    args: { id: "css-check-title", className: "raurus:text-red-500" },
    render: (args) => <EditableH1 {...args}>CssCheck</EditableH1>,
    play: async ({ canvas }) => {
        const heading = canvas.getByRole("heading", { name: /csscheck/iu });
        await expect(getComputedStyle(heading).color).toBe("oklch(0.637 0.237 25.331)");
    },
};
