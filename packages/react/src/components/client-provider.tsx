import { useCallback, useRef, useState } from "react";
import type { FC, PropsWithChildren } from "react";

import type { Data } from "@/common";
import { RaurusContext } from "@/context";

interface Props {
    url: string | URL;
    initialData?: Data[];
}

const DEFAULT_INITIAL_DATA = [] as Data[];

export const RaurusClientProvider: FC<PropsWithChildren<Props>> = ({
    children,
    initialData = DEFAULT_INITIAL_DATA,
}) => {
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const placeholders = useRef(new Map(initialData.map((v) => [v.placeholder_id, v])));

    const getById = useCallback((id: string) => placeholders.current.get(id), []);

    const select = useCallback((id: string) => {
        setSelectedId(id);
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

    return (
        <RaurusContext.Provider
            value={{
                editMode,
                startEditing,
                stopEditing,

                selectedId,
                select,

                editingId,
                toggleEditMode,

                getById,
            }}
        >
            {children}
        </RaurusContext.Provider>
    );
};
