import type { CSSProperties } from "react";

interface EditableImageProps {
    isEditing: boolean;
    isSelected: boolean;
    src: string;
    onClick: () => void;
    className?: string;
    style?: CSSProperties;
    alt?: string;
}

export function EditableImage({
    isEditing,
    isSelected,
    src,
    onClick,
    className,
    style,
    alt = "",
}: EditableImageProps) {
    if (!src) {
        return null;
    }

    if (isEditing) {
        return (
            <button
                type="button"
                className={`relative inline-block ${className ?? ""}`}
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
                <img src={src} alt={alt} className="block max-w-full h-auto" />
            </button>
        );
    }

    return <img src={src} alt={alt} className={className} style={style} />;
}
