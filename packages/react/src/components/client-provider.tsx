import { useCallback, useEffect, useRef, useState } from "react";
import type { FC, PropsWithChildren } from "react";

import type { Data } from "@/common";
import { RaurusContext } from "@/context";

export interface RaurusClientProviderProps {
    url: string | URL;
    initialData?: Data[];
    defaultEditMode?: boolean;
}

const DEFAULT_INITIAL_DATA = [] as Data[];
const DEFAULT_EDIT_MODE = false;

export const RaurusClientProvider: FC<PropsWithChildren<RaurusClientProviderProps>> = ({
    children,
    defaultEditMode = DEFAULT_EDIT_MODE,
    initialData = DEFAULT_INITIAL_DATA,
}) => {
    const [editMode, setEditMode] = useState(defaultEditMode);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const placeholders = useRef(new Map(initialData.map((v) => [v.placeholder_id, v])));

    const getById = useCallback((id: string) => placeholders.current.get(id), []);

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

    const toggleEditMode = () => setEditMode((prev) => !prev);

    const selectedRef = useRef(selectedId);
    selectedRef.current = selectedId;
    const editingRef = useRef(editingId);
    editingRef.current = editingId;

    useEffect(() => {
        function handleMouseDown(e: globalThis.MouseEvent) {
            if (!selectedRef.current && !editingRef.current) {
                return;
            }

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

    return (
        <RaurusContext.Provider
            value={{
                editMode,
                startEditing,
                stopEditing,

                selectedId,
                select,
                deselect,

                editingId,
                toggleEditMode,

                getById,
            }}
        >
            {children}
        </RaurusContext.Provider>
    );
};
