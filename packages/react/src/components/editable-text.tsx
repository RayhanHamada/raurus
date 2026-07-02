import cn from "cnfast";
import { createElement, Fragment, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps, FocusEventHandler, HTMLElementType, JSX, MouseEventHandler, RefObject } from "react";
import { createPortal } from "react-dom";

import { useRaurus } from "@/hooks";

type EditableTag = Extract<HTMLElementType, "a" | "div" | "p" | "span" | `h${1 | 2 | 3 | 4 | 5 | 6}`>;

export interface EditableTextOwnProps {
    id: string;
    plainText?: boolean;
}

interface IdTooltipProps {
    element: HTMLElement | null;
    id: string;
}

const BASE_EDITABLE_CLASSES = cn(
    "raurus:data-raurus-edit-mode:outline",
    "raurus:data-raurus-edit-mode:outline-dotted",
    "raurus:data-raurus-edit-mode:outline-zinc-400",
    "raurus:data-raurus-edit-mode:hover:outline-blue-400",
    "raurus:data-raurus-selected:outline-2",
    "raurus:data-raurus-selected:outline-solid",
    "raurus:data-raurus-selected:outline-blue-500",
    "raurus:data-raurus-editing:outline-green-500",
    "raurus:data-raurus-editing:cursor-text"
);

const BASE_TOOLTIP_CLASSES = cn(
    "raurus:fixed",
    "raurus:z-50",
    "raurus:pointer-events-none",
    "raurus:bg-blue-500",
    "raurus:text-white",
    "raurus:text-xs",
    "raurus:px-1.5",
    "raurus:py-0.5",
    "raurus:rounded",
    "raurus:whitespace-nowrap",
    "raurus:font-mono"
);

function IdTooltip({ element, id }: IdTooltipProps) {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!element || !ref.current) {
            return;
        }
        const rect = element.getBoundingClientRect();
        ref.current.style.top = `${rect.top + window.scrollY}px`;
        ref.current.style.left = `${rect.left + window.scrollX}px`;
        ref.current.style.transform = "translateY(-100%)";
    });

    return createPortal(
        <div ref={ref} className={BASE_TOOLTIP_CLASSES}>
            {id}
        </div>,
        document.body
    );
}

function useEditingFocus(ref: RefObject<HTMLElement | null>, editing: boolean) {
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
    }, [editing, ref]);
}

function createEditableTextElement<Tag extends EditableTag>(As: Tag) {
    type Props = EditableTextOwnProps & Omit<ComponentProps<Tag>, "contentEditable">;

    function Component(props: Props) {
        const ctx = useRaurus();
        const ref = useRef<HTMLElement>(null);

        const isSelected = ctx.selectedId === props.id;
        const isEditing = ctx.editMode && ctx.editingId === props.id;
        const contentEditable = isEditing && props.plainText ? ("plaintext-only" as const) : isEditing;

        const propsOnClick = props.onClick as MouseEventHandler<Element> | undefined;
        const propsOnBlur = props.onBlur as FocusEventHandler<Element> | undefined;

        const className = useMemo(() => cn(BASE_EDITABLE_CLASSES, props.className), [props.className]);

        const [hovered, setHovered] = useState(false);

        useEditingFocus(ref, isEditing);

        const onClick = useCallback<MouseEventHandler<Element>>(
            (e) => {
                propsOnClick?.(e);

                if (!ctx.editMode) {
                    return;
                }

                if (!isSelected) {
                    ctx.select(props.id);
                    return;
                }

                if (!isEditing) {
                    ctx.startEditing(props.id);
                }
            },
            [props.id, ctx, isSelected, isEditing, propsOnClick]
        );

        const onBlur = useCallback<FocusEventHandler<Element>>(
            (e) => {
                propsOnBlur?.(e);

                ctx.stopEditing();
            },
            [ctx, propsOnBlur]
        );

        const onMouseEnter = useCallback<MouseEventHandler<Element>>(() => setHovered(true), []);
        const onMouseLeave = useCallback<MouseEventHandler<Element>>(() => setHovered(false), []);

        const editableElement = createElement(As, {
            ...props,
            ref,
            suppressContentEditableWarning: true,
            className,
            contentEditable,
            onClick,
            onBlur,
            onMouseEnter,
            onMouseLeave,
            "data-raurus-id": props.id,
            "data-raurus-edit-mode": ctx.editMode || undefined,
            "data-raurus-selected": isSelected || undefined,
            "data-raurus-editing": isEditing || undefined,
        }) as JSX.Element;

        const shouldShowTooltip = ctx.editMode && (isSelected || isEditing || hovered);

        return (
            <Fragment>
                {shouldShowTooltip && <IdTooltip element={ref.current} id={props.id} />}
                {editableElement}
            </Fragment>
        );
    }

    Component.displayName = `RaurusEditable${As.toUpperCase()}` as const;
    return Component;
}

export const {
    EditableDiv,
    EditableP,
    EditableSpan,
    EditableH1,
    EditableH2,
    EditableH3,
    EditableH4,
    EditableH5,
    EditableH6,
    EditableLink,
} = {
    EditableLink: createEditableTextElement("a"),
    EditableDiv: createEditableTextElement("div"),
    EditableP: createEditableTextElement("p"),
    EditableSpan: createEditableTextElement("span"),
    EditableH1: createEditableTextElement("h1"),
    EditableH2: createEditableTextElement("h2"),
    EditableH3: createEditableTextElement("h3"),
    EditableH4: createEditableTextElement("h4"),
    EditableH5: createEditableTextElement("h5"),
    EditableH6: createEditableTextElement("h6"),
} as const;
