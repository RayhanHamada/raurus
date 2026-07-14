import { useStore } from "@nanostores/react";
import { useEffect, useLayoutEffect, useMemo } from "react";
import type { FC, PropsWithChildren } from "react";

import type { Data } from "@/common";
import { RaurusContext } from "@/context";
import type { IRaurusContext } from "@/context";
import { $editMode, $editingId, $placeholders, $selectedId } from "@/state";

export interface RaurusClientProviderProps {
    url: string | URL;
    enableEdit?: boolean;
}

const toggleEditMode = () => $editMode.set(!$editMode.get());
const setEditMode = (mode: boolean) => $editMode.set(mode);

const getById = (id: string) => $placeholders.get()[id];

const upsertPlaceholder = (id: string, data: Data) => {
    $placeholders.set({ ...$placeholders.get(), [id]: data });
};

const select = (id: string) => {
    $selectedId.set(id);
    $editingId.set(null);
};

const deselect = () => {
    $selectedId.set(null);
    $editingId.set(null);
};

const startEditing = (id: string) => {
    $selectedId.set(id);
    $editingId.set(id);
};

const stopEditing = () => {
    $editingId.set(null);
};

const DEFAULT_PROPS = {
    enableEdit: false,
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

    const value = useMemo<IRaurusContext>(
        () => ({
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
        }),
        [editMode, editingId, selectedId]
    );

    return <RaurusContext.Provider value={value}>{children}</RaurusContext.Provider>;
};
