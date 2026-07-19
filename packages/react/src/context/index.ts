import { createContext } from "react";

import type { Data } from "@/common";

export interface IRaurusContext {
    editMode: boolean;
    setEditMode: (mode: boolean) => void;

    selectedId: string | null;
    editingId: string | null;

    select: (id: string) => void;
    deselect: () => void;
    startEditing: (id: string) => void;
    stopEditing: () => void;

    getById: (id: string) => Data | undefined;
    upsertPlaceholder: (id: string, data: Data) => void;
    /** Register a placeholder if not already present — called by editable components on mount. */
    registerPlaceholder: (id: string, innerHTML: string) => void;
}

export const RaurusContext = createContext<IRaurusContext | null>(null);
