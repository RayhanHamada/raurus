import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FC, PropsWithChildren } from "react";

import type { Data } from "@/common";
import { RaurusContext } from "@/context";
import type { IRaurusContext } from "@/context";

export interface RaurusClientProviderProps {
    url: string | URL;
    enableEdit?: boolean;
    initialPlaceholders?: Map<string, Data>;
}

export const RaurusClientProvider: FC<PropsWithChildren<RaurusClientProviderProps>> = ({
    children,
    enableEdit,
    initialPlaceholders,
}) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const placeholdersRef = useRef<Map<string, Data>>(initialPlaceholders ?? new Map());

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

    const getById = useCallback((id: string) => placeholdersRef.current.get(id), []);

    const upsertPlaceholder = useCallback((id: string, data: Data) => {
        placeholdersRef.current.set(id, data);
    }, []);

    const registerPlaceholder = useCallback((id: string, innerHTML: string) => {
        if (placeholdersRef.current.has(id)) {
            return;
        }
        placeholdersRef.current.set(id, { placeholder_id: id, type: "text" as const, content: innerHTML });
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
            registerPlaceholder,
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
            registerPlaceholder,
        ]
    );

    return <RaurusContext.Provider value={value}>{children}</RaurusContext.Provider>;
};
