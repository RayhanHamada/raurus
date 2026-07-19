import cn from "cnfast";
import { createElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps, FocusEventHandler, HTMLElementType, MouseEventHandler, RefObject } from "react";
import { createPortal } from "react-dom";

import { useRaurus } from "@/hooks";

type EditableTag = Extract<HTMLElementType, "a" | "div" | "p" | "span" | `h${1 | 2 | 3 | 4 | 5 | 6}`>;

export interface EditableFieldOwnProps {
    id: string;
    plainText?: boolean;
}

interface IdTooltipProps {
    targetElementRef: RefObject<HTMLElement | null>;
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

function IdTooltip({ targetElementRef, id }: IdTooltipProps) {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!targetElementRef.current || !ref.current) {
            return;
        }

        const rect = targetElementRef.current.getBoundingClientRect();
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

function createEditableField<Tag extends EditableTag>(As: Tag) {
    type Props = EditableFieldOwnProps & Omit<ComponentProps<Tag>, "contentEditable">;

    function Component(props: Props) {
        const ctx = useRaurus();
        const ref = useRef<HTMLElement>(null);

        const isSelected = ctx.selectedId === props.id;
        const isEditing = ctx.editMode && ctx.editingId === props.id;
        const contentEditable = isEditing && props.plainText ? ("plaintext-only" as const) : isEditing;

        const propsOnClick = props.onClick as MouseEventHandler<HTMLElement> | undefined;
        const propsOnBlur = props.onBlur as FocusEventHandler<HTMLElement> | undefined;

        const className = useMemo(() => cn(BASE_EDITABLE_CLASSES, props.className), [props.className]);

        const [hovered, setHovered] = useState(false);

        useEditingFocus(ref, isEditing);

        // Auto-register on mount if placeholder not already in store
        useEffect(() => {
            const el = ref.current;
            if (!el) {
                return;
            }
            ctx.registerPlaceholder(props.id, el.innerHTML);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        const onClick = useCallback<MouseEventHandler<HTMLElement>>(
            (e) => {
                if (ctx.editMode && As === "a") {
                    e.preventDefault();
                }

                if (!ctx.editMode) {
                    propsOnClick?.(e);
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

        const onBlur = useCallback<FocusEventHandler<HTMLElement>>(
            (e) => {
                propsOnBlur?.(e);
                ctx.stopEditing();
            },
            [ctx, propsOnBlur]
        );

        const onMouseEnter = useCallback<MouseEventHandler<HTMLElement>>(() => setHovered(true), []);
        const onMouseLeave = useCallback<MouseEventHandler<HTMLElement>>(() => setHovered(false), []);

        const shouldShowTooltip = ctx.editMode && (isSelected || isEditing || hovered);

        return (
            <>
                {shouldShowTooltip && <IdTooltip targetElementRef={ref} id={props.id} />}
                {createElement(As, {
                    ...props,
                    ref,
                    className,
                    contentEditable,
                    onClick,
                    onBlur,
                    onMouseEnter,
                    onMouseLeave,
                    suppressContentEditableWarning: true,
                    "data-raurus-id": props.id,
                    "data-raurus-edit-mode": ctx.editMode || undefined,
                    "data-raurus-selected": isSelected || undefined,
                    "data-raurus-editing": isEditing || undefined,
                })}
            </>
        );
    }

    Component.displayName = `RaurusEditable${As.toUpperCase()}` as const;
    return Component;
}

export const EditableLink = createEditableField("a");
export const EditableDiv = createEditableField("div");
export const EditableP = createEditableField("p");
export const EditableSpan = createEditableField("span");
export const EditableH1 = createEditableField("h1");
export const EditableH2 = createEditableField("h2");
export const EditableH3 = createEditableField("h3");
export const EditableH4 = createEditableField("h4");
export const EditableH5 = createEditableField("h5");
export const EditableH6 = createEditableField("h6");
