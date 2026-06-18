import type { CSSProperties } from "react";

import { useRaurus } from "./RaurusProvider";
import { useContent } from "./useContent";

interface ContentData {
    type: "photo" | "video";
    assetKey: string;
    placeholderId: string;
}

interface EditableImageProps {
    placeholderId: string;
    fallback?: string;
    className?: string;
    style?: CSSProperties;
    alt?: string;
}

export function EditableImage({ placeholderId, fallback, className, style, alt = "" }: EditableImageProps) {
    const { baseUrl, isEditing, selectPlaceholder, selectedPlaceholderId } = useRaurus();
    const { content } = useContent(placeholderId);

    const isSelected = selectedPlaceholderId === placeholderId;
    const data = content as ContentData | null;
    const assetKey = data?.type === "photo" ? data.assetKey : null;
    const src = assetKey ? `${baseUrl}/asset-content/${encodeURIComponent(assetKey)}` : fallback;

    if (!src) {
        return null;
    }

    if (isEditing) {
        return (
            <button
                className={`relative inline-block ${className ?? ""}`}
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
                <img src={src} alt={alt} className="block max-w-full h-auto" />
            </button>
        );
    }

    return <img src={src} alt={alt} className={className} style={style} />;
}
