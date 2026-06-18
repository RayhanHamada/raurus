import type { CSSProperties } from "react";

interface EditableTextProps {
    isEditing: boolean;
    isSelected: boolean;
    text: string;
    onClick: () => void;
    as?: "h1" | "h2" | "h3" | "p" | "span";
    className?: string;
    style?: CSSProperties;
}

export function EditableText({
    isEditing,
    isSelected,
    text,
    onClick,
    as: Tag = "p",
    className,
    style,
}: EditableTextProps) {
    if (!text) {
        return null;
    }

    if (isEditing) {
        return (
            <Tag
                className={className}
                style={{
                    border: `2px dashed ${isSelected ? "#3b82f6" : "#9ca3af"}`,
                    cursor: "pointer",
                    ...style,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                {text}
            </Tag>
        );
    }

    return (
        <Tag className={className} style={style}>
            {text}
        </Tag>
    );
}
