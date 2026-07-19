import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import type { FC, PropsWithChildren } from "react";

import type { Data } from "@/common";
import { RaurusContext } from "@/context";
import type { IRaurusContext } from "@/context";

export interface RaurusClientProviderProps {
    url: string | URL;
    enableEdit?: boolean;
}

export const RaurusClientProvider: FC<PropsWithChildren<RaurusClientProviderProps>> = ({ children, enableEdit }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [placeholders, setPlaceholders] = useState<Record<string, Data>>({});

    const [internalEditMode, setInternalEditMode] = useState(false);
    const editMode = enableEdit ?? internalEditMode;

    const setEditMode = useCallback(
        (value: boolean) => {
            if (enableEdit === undefined) {
                setInternalEditMode(value);
            }
        },
        [enableEdit]
    );

    const getById = useCallback((id: string) => placeholders[id], [placeholders]);

    const upsertPlaceholder = useCallback((id: string, data: Data) => {
        setPlaceholders((prev) => ({ ...prev, [id]: data }));
    }, []);

    const select = useCallback((id: string) => {
        setSelectedId(id);
        setEditingId(null);
    }, []);

    const deselect = useCallback(() => {
        setSelectedId(null);
        setEditingId(null);
    }, []);

    const startEditing = useCallback((id: string) => {
        setSelectedId(id);
        setEditingId(id);
    }, []);

    const stopEditing = useCallback(() => {
        setEditingId(null);
    }, []);

    useLayoutEffect(() => {
        function handleMouseDown(e: globalThis.MouseEvent) {
            const target = e.target as HTMLElement | null;

            if (target?.closest("[data-raurus-id]")) {
                return;
            }

            setSelectedId(null);
            setEditingId(null);
        }

        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
    }, []);

    const value = useMemo<IRaurusContext>(
        () => ({
            editMode,
            startEditing,
            stopEditing,

            selectedId,
            select,
            deselect,

            editingId,
            setEditMode,

            getById,
            upsertPlaceholder,
        }),
        [
            editMode,
            editingId,
            selectedId,
            startEditing,
            stopEditing,
            select,
            deselect,
            setEditMode,
            getById,
            upsertPlaceholder,
        ]
    );

    return <RaurusContext.Provider value={value}>{children}</RaurusContext.Provider>;
};
