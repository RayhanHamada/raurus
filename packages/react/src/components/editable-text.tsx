import cn from "cnfast";
import { createElement, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import type {
    ComponentProps,
    FocusEvent,
    FocusEventHandler,
    HTMLElementType,
    JSX,
    MouseEvent,
    MouseEventHandler,
} from "react";

import { useRaurus } from "@/hooks";

type EditableTag = Extract<HTMLElementType, "a" | "div" | "p" | "span" | `h${1 | 2 | 3 | 4 | 5 | 6}`>;

interface OwnProps {
    id: string;
    plainText?: boolean;
}

function createEditableTextElement<Tag extends EditableTag>(As: Tag) {
    type Props = OwnProps & Omit<ComponentProps<Tag>, "contentEditable">;

    function Component(props: Props) {
        const ctx = useRaurus();

        const selected = ctx.selectedId === props.id;
        const editing = ctx.editMode && ctx.editingId === props.id;
        const contentEditable = ctx.editMode && props.plainText ? "plaintext-only" : ctx.editMode;

        const customOnClick = props.onClick as MouseEventHandler<Element> | undefined;
        const customOnBlur = props.onBlur as FocusEventHandler<Element> | undefined;

        const className = useMemo(
            () =>
                cn(
                    // Edit mode
                    "raurus:data-raurus-edit-mode:outline raurus:data-raurus-edit-mode:outline-dotted raurus:data-raurus-edit-mode:outline-zinc-400",

                    // Hover
                    "raurus:data-raurus-edit-mode:hover:outline-blue-400",

                    // Selected
                    "raurus:data-raurus-selected:outline-2 raurus:data-raurus-selected:outline-solid raurus:data-raurus-selected:outline-blue-500",

                    // Editing
                    "raurus:data-raurus-editing:outline-green-500 raurus:data-raurus-editing:cursor-text",
                    props.className
                ),
            [props.className]
        );
        const ref = useRef<HTMLElement>(null);

        const onClick = useCallback(
            (e: MouseEvent<Element>) => {
                customOnClick?.(e);

                if (!ctx.editMode) {
                    return;
                }

                if (!selected) {
                    ctx.select(props.id);
                    return;
                }

                if (!editing) {
                    ctx.startEditing(props.id);
                }
            },
            [props.id, ctx, selected, editing, customOnClick]
        );

        /**
         * Blur when
         * * exit editing
         */
        const onBlur = useCallback(
            (e: FocusEvent<Element>) => {
                customOnBlur?.(e);

                ctx.stopEditing();
            },
            [ctx, customOnBlur]
        );

        /**
         * Focus when editing begins
         */
        useLayoutEffect(() => {
            if (!editing) {
                return;
            }

            const el = ref.current;

            if (!el) {
                return;
            }

            el.focus();

            const selection = window.getSelection();

            if (!selection) {
                return;
            }

            const range = document.createRange();

            range.selectNodeContents(el);
            range.collapse(false);

            selection.removeAllRanges();
            selection.addRange(range);
        }, [editing]);

        return createElement(As, {
            ...props,
            ref,
            className,
            contentEditable,
            onClick,
            onBlur,

            "data-raurus-id": props.id,
            "data-raurus-edit-mode": ctx.editMode || undefined,
            "data-raurus-selected": selected || undefined,
            "data-raurus-editing": editing || undefined,
        }) as JSX.Element;
    }

    Component.displayName = `RaurusEditable${As.toUpperCase()}` as const;

    return Component;
}

const editable = {
    A: createEditableTextElement("a"),
    Div: createEditableTextElement("div"),
    P: createEditableTextElement("p"),
    Span: createEditableTextElement("span"),
    H1: createEditableTextElement("h1"),
    H2: createEditableTextElement("h2"),
    H3: createEditableTextElement("h3"),
    H4: createEditableTextElement("h4"),
    H5: createEditableTextElement("h5"),
    H6: createEditableTextElement("h6"),
} as const;

export const {
    A: EditableLink,
    Div: EditableDiv,
    Span: EditableSpan,
    H1: EditableH1,
    H2: EditableH2,
    H3: EditableH3,
    H4: EditableH4,
    H5: EditableH5,
    H6: EditableH6,
} = editable;
