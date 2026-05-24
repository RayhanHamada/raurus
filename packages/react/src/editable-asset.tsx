import { useEffect, useState } from "react";

import { useRaurusContext } from "./context";
import type { EditableAssetProps } from "./types";

export const EditableAsset = ({ children, id }: EditableAssetProps) => {
    const {
        editModeEnabled,
        getAsset,
        refreshAsset,
        selectAsset,
        selectedAssetId,
    } = useRaurusContext();
    const [asset, setAsset] =
        useState<Awaited<ReturnType<typeof getAsset>>>(null);

    useEffect(() => {
        const loadAsset = async (): Promise<void> => {
            const result = await getAsset(id);
            setAsset(result);
        };

        void loadAsset();
    }, [getAsset, id]);

    useEffect(() => {
        if (selectedAssetId !== id) {
            return;
        }

        const loadSelectedAsset = async (): Promise<void> => {
            const result = await refreshAsset(id);
            setAsset(result);
        };

        void loadSelectedAsset();
    }, [id, refreshAsset, selectedAssetId]);

    const isSelected = selectedAssetId === id;

    const content = children({
        asset,
        edit: () => {
            selectAsset(id);
        },
        isAdmin: editModeEnabled,
        isSelected,
    });

    if (!editModeEnabled) {
        return <>{content}</>;
    }

    return (
        <div
            data-raurus-editable={id}
            style={{
                border: isSelected
                    ? "2px solid #1d4ed8"
                    : "2px dashed rgba(29, 78, 216, 0.35)",
                borderRadius: 12,
                cursor: "pointer",
                padding: 6,
                position: "relative",
                transition: "border-color 160ms ease, box-shadow 160ms ease",
            }}
        >
            {content}
            <button
                aria-label={`Edit asset ${id}`}
                onClick={() => {
                    selectAsset(id);
                }}
                style={{
                    appearance: "none",
                    background: "transparent",
                    border: "none",
                    borderRadius: 12,
                    cursor: "pointer",
                    inset: 0,
                    position: "absolute",
                }}
                type="button"
            />
        </div>
    );
};
