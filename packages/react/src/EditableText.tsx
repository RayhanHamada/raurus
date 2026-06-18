import type { CSSProperties } from "react";

import { useRaurus } from "./RaurusProvider";
import { useContent } from "./useContent";

interface ContentData {
    type: "text";
    text: string;
    placeholderId: string;
}

interface EditableTextProps {
    placeholderId: string;
    as?: "h1" | "h2" | "h3" | "p" | "span";
    fallback?: string;
    className?: string;
    style?: CSSProperties;
}

export function EditableText({ placeholderId, as: Tag = "p", fallback, className, style }: EditableTextProps) {
    const { isEditing, selectPlaceholder, selectedPlaceholderId } = useRaurus();
    const { content } = useContent(placeholderId);

    const isSelected = selectedPlaceholderId === placeholderId;
    const data = content as ContentData | null;
    const text = data?.type === "text" ? data.text : fallback;

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
                    selectPlaceholder(isSelected ? null : placeholderId);
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
