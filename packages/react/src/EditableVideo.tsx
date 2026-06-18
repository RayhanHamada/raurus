import type { CSSProperties } from "react";

interface EditableVideoProps {
    isEditing: boolean;
    isSelected: boolean;
    src: string;
    onClick: () => void;
    className?: string;
    style?: CSSProperties;
    controls?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
}

export function EditableVideo({
    isEditing,
    isSelected,
    src,
    onClick,
    className,
    style,
    controls,
    autoPlay,
    muted,
    loop,
}: EditableVideoProps) {
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
