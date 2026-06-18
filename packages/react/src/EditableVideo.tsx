import type { CSSProperties } from "react";

import { useRaurus } from "./RaurusProvider";
import { useContent } from "./useContent";

interface ContentData {
    type: "photo" | "video";
    assetKey: string;
    placeholderId: string;
}

interface EditableVideoProps {
    placeholderId: string;
    fallback?: string;
    className?: string;
    style?: CSSProperties;
    controls?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
}

export function EditableVideo({
    placeholderId,
    fallback,
    className,
    style,
    controls,
    autoPlay,
    muted,
    loop,
}: EditableVideoProps) {
    const { baseUrl, isEditing, selectPlaceholder, selectedPlaceholderId } = useRaurus();
    const { content } = useContent(placeholderId);

    const isSelected = selectedPlaceholderId === placeholderId;
    const data = content as ContentData | null;
    const assetKey = data?.type === "video" ? data.assetKey : null;
    const src = assetKey ? `${baseUrl}/asset-content/${encodeURIComponent(assetKey)}` : fallback;

    if (!src) {
        return null;
    }

    const videoElement = (
        <video
            src={src}
            controls={controls}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            className="block max-w-full h-auto"
        />
    );

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
                {videoElement}
            </button>
        );
    }

    return (
        <div className={className} style={style}>
            {videoElement}
        </div>
    );
}
