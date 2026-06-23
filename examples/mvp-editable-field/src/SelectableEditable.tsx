import { useEffect, useRef, useState, type HTMLProps, type ReactNode } from "react";

interface Props extends Omit<HTMLProps<HTMLDivElement>, "contentEditable" | "children"> {
    children?: ReactNode;
}

type Mode = "idle" | "selected" | "editing";

export function SelectableEditable({ children, className, ...props }: Props) {
    const [mode, setMode] = useState<Mode>("idle");
    const ref = useRef<HTMLDivElement>(null);
    const start = useRef<[number, number]>([0, 0]);

    useEffect(() => {
        if (mode !== "editing" || !ref.current) return;

        ref.current.focus();

        const range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }, [mode]);

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (!e.target) return;
            if (!ref.current?.contains(e.target as Node)) {
                setMode("idle");
            }
        };

        document.addEventListener("mousedown", onMouseDown);
        return () => document.removeEventListener("mousedown", onMouseDown);
    }, []);

    return (
        <div
            ref={ref}
            contentEditable={mode === "editing"}
            suppressContentEditableWarning
            onMouseDown={(e) => {
                start.current = [e.clientX, e.clientY];
            }}
            onMouseUp={(e) => {
                const [x, y] = start.current;

                if (Math.abs(e.clientX - x) > 4 || Math.abs(e.clientY - y) > 4) {
                    return;
                }

                setMode((mode) => (mode === "idle" ? "selected" : mode === "selected" ? "editing" : mode));
            }}
            className={[
                "outline-none border border-dashed rounded border-gray-300 transition hover:border-gray-400 hover:bg-gray-50",
                mode === "idle" && "overflow-hidden cursor-pointer",
                mode === "selected" && "ring-2 ring-blue-400 resize overflow-auto cursor-pointer",
                mode === "editing" && "overflow-scroll cursor-text",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            {...props}
        >
            {children}
        </div>
    );
}
