import type {
    AssetRecord,
    PermissionContext,
    RaurusRuntime,
} from "@raurus/core";
import { createContext, useContext } from "react";

import type { RuntimeMutationState } from "../types";

export interface RaurusContextValue {
    closeInspector(): void;
    editModeEnabled: boolean;
    getAsset(id: string): Promise<AssetRecord | null>;
    mutationState: RuntimeMutationState;
    permissionContext: PermissionContext | undefined;
    refreshAsset(id: string): Promise<AssetRecord | null>;
    removeSelectedAsset(): Promise<void>;
    replaceSelectedAsset(file: File): Promise<void>;
    runtime: RaurusRuntime;
    selectAsset(id: string): void;
    selectedAsset: AssetRecord | null;
    selectedAssetId: string | null;
}

const RaurusContext = createContext<RaurusContextValue | null>(null);

export const RaurusContextProvider = RaurusContext.Provider;

export const useRaurusContext = (): RaurusContextValue => {
    const value = useContext(RaurusContext);

    if (!value) {
        throw new Error(
            "Raurus React components must be used within RaurusProvider."
        );
    }

    return value;
};
