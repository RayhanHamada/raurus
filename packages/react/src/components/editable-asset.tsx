import { useEffect, useState } from "react";

import { useRaurusContext } from "../context/raurus-context";
import { cn } from "../lib/cn";
import type { EditableAssetProps } from "../types";

const editableAssetClassName = cn(
    "raurus:relative",
    "raurus:rounded-xl",
    "raurus:border-2",
    "raurus:p-1.5",
    "raurus:transition-[border-color,box-shadow]"
);

const editableAssetIdleClassName = cn(
    "raurus:border-dashed",
    "raurus:border-blue-700/35",
    "raurus:hover:border-blue-600/60"
);

const editableAssetSelectedClassName = cn(
    "raurus:border-blue-700",
    "raurus:shadow-[0_0_0_3px_rgba(29,78,216,0.16)]"
);

const editableAssetTriggerClassName = cn(
    "raurus:absolute",
    "raurus:inset-0",
    "raurus:appearance-none",
    "raurus:rounded-xl",
    "raurus:border-0",
    "raurus:bg-transparent",
    "raurus:cursor-pointer",
    "raurus:focus-visible:outline-none",
    "raurus:focus-visible:ring-2",
    "raurus:focus-visible:ring-blue-600",
    "raurus:focus-visible:ring-offset-2"
);

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
            className={cn(
                editableAssetClassName,
                isSelected
                    ? editableAssetSelectedClassName
                    : editableAssetIdleClassName
            )}
            data-raurus-editable={id}
        >
            {content}
            <button
                aria-label={`Edit asset ${id}`}
                className={editableAssetTriggerClassName}
                onClick={() => {
                    selectAsset(id);
                }}
                type="button"
            />
        </div>
    );
};
