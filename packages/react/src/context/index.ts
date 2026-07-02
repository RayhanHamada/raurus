import { createContext } from "react";

import type { Data } from "@/common";

export interface IRaurusContext {
    editMode: boolean;
    toggleEditMode: () => void;

    selectedId: string | null;
    editingId: string | null;

    select: (id: string) => void;
    deselect: () => void;
    startEditing: (id: string) => void;
    stopEditing: () => void;

    getById: (id: string) => Data | undefined;
}

export const RaurusContext = createContext<IRaurusContext | null>(null);
