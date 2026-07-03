import { useStore } from "@nanostores/react";
import { useCallback, useEffect, useLayoutEffect } from "react";
import type { FC, PropsWithChildren } from "react";

import type { Data } from "@/common";
import { RaurusContext } from "@/context";
import { $editMode, $editingId, $placeholders, $selectedId } from "@/state";

export interface RaurusClientProviderProps {
    url: string | URL;
    enableEdit?: boolean;
}

const toggleEditMode = () => $editMode.set(!$editMode.get());
const setEditMode = (mode: boolean) => $editMode.set(mode);

const DEFAULT_PROPS = {
    enableEdit: true,
} satisfies Partial<RaurusClientProviderProps>;

export const RaurusClientProvider: FC<PropsWithChildren<RaurusClientProviderProps>> = ({
    children,
    enableEdit = DEFAULT_PROPS.enableEdit,
}) => {
    useEffect(() => {
        $editMode.set(enableEdit);
    }, [enableEdit]);

    const editMode = useStore($editMode);
    const selectedId = useStore($selectedId);
    const editingId = useStore($editingId);

    const getById = useCallback((id: string) => $placeholders.get()[id], []);

    const upsertPlaceholder = useCallback((id: string, data: Data) => {
        $placeholders.set({ ...$placeholders.get(), [id]: data });
    }, []);

    const select = useCallback((id: string) => {
        $selectedId.set(id);
        $editingId.set(null);
    }, []);

    const deselect = useCallback(() => {
        $selectedId.set(null);
        $editingId.set(null);
    }, []);

    const startEditing = useCallback((id: string) => {
        $selectedId.set(id);
        $editingId.set(id);
    }, []);

    const stopEditing = useCallback(() => {
        $editingId.set(null);
    }, []);

    useLayoutEffect(() => {
        function handleMouseDown(e: globalThis.MouseEvent) {
            if (!$selectedId.get() && !$editingId.get()) {
                return;
            }

            const target = e.target as HTMLElement | null;

            if (target?.closest("[data-raurus-id]")) {
                return;
            }

            $selectedId.set(null);
            $editingId.set(null);
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
                setEditMode,

                getById,
                upsertPlaceholder,
            }}
        >
            {children}
        </RaurusContext.Provider>
    );
};
