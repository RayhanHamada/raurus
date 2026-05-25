import type {
    IAssetRecord,
    PermissionContext,
    RaurusRuntime,
} from "@raurus/core";
import type { ReactNode } from "react";

export interface EditableRenderContext {
    asset: IAssetRecord | null;
    edit(): void;
    isAdmin: boolean;
    isSelected: boolean;
}

export interface EditableAssetProps {
    children(ctx: EditableRenderContext): ReactNode;
    id: string;
}

export interface RuntimeMutationState {
    errorMessage: string | null;
    isPending: boolean;
}

export interface RaurusProviderProps {
    children: ReactNode;
    permissionContext?: PermissionContext;
    runtime: RaurusRuntime;
}
