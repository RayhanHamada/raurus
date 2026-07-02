import cn from "cnfast";
import { createElement, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type {
    ComponentProps,
    FocusEvent,
    FocusEventHandler,
    HTMLElementType,
    JSX,
    MouseEvent,
    MouseEventHandler,
} from "react";
import { createPortal } from "react-dom";

import { useRaurus } from "@/hooks";

type EditableTag = Extract<HTMLElementType, "a" | "div" | "p" | "span" | `h${1 | 2 | 3 | 4 | 5 | 6}`>;

export interface EditableTextOwnProps {
    id: string;
    plainText?: boolean;
}

function createEditableTextElement<Tag extends EditableTag>(As: Tag) {
    type Props = EditableTextOwnProps & Omit<ComponentProps<Tag>, "contentEditable">;

    function Component(props: Props) {
        const ctx = useRaurus();

        const selected = ctx.selectedId === props.id;
        const editing = ctx.editMode && ctx.editingId === props.id;
        const contentEditable = editing && props.plainText ? "plaintext-only" : editing;

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
        const [hovered, setHovered] = useState(false);
        const tooltipRef = useRef<HTMLDivElement>(null);

        useLayoutEffect(() => {
            if (!hovered || !ref.current || !tooltipRef.current) {
                return;
            }

            const rect = ref.current.getBoundingClientRect();
            const tooltip = tooltipRef.current;

            tooltip.style.top = `${rect.top + window.scrollY}px`;
            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.transform = "translateY(-100%)";
        }, [hovered]);

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

        const onMouseEnter = useCallback(() => setHovered(true), []);
        const onMouseLeave = useCallback(() => setHovered(false), []);

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

        return (
            <>
                {ctx.editMode &&
                    (hovered || selected || editing) &&
                    createPortal(
                        <div
                            ref={tooltipRef}
                            className="raurus:fixed raurus:z-50 raurus:pointer-events-none raurus:bg-blue-500 raurus:text-white raurus:text-xs raurus:px-1.5 raurus:py-0.5 raurus:rounded raurus:whitespace-nowrap raurus:font-mono"
                        >
                            {props.id}
                        </div>,
                        document.body
                    )}
                {
                    createElement(As, {
                        ...props,
                        suppressContentEditableWarning: true,
                        ref,
                        className,
                        contentEditable,
                        onClick,
                        onBlur,
                        onMouseEnter,
                        onMouseLeave,

                        "data-raurus-id": props.id,
                        "data-raurus-edit-mode": ctx.editMode || undefined,
                        "data-raurus-selected": selected || undefined,
                        "data-raurus-editing": editing || undefined,
                    }) as JSX.Element
                }
            </>
        );
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
