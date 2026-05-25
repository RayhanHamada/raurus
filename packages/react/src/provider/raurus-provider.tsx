import { startTransition, useEffect, useState } from "react";

import { RaurusAdminChrome } from "@/components/raurus-admin-chrome";
import { RaurusContextProvider } from "@/context/raurus-context";
import type { RaurusProviderProps, RuntimeMutationState } from "@/types";

const VIEWER_STATE: RuntimeMutationState = {
    errorMessage: null,
    isPending: false,
};

const hasEditQueryParam = (): boolean => {
    if (typeof window === "undefined") {
        return false;
    }

    return new URLSearchParams(window.location.search).get("edit") === "true";
};

export const RaurusProvider = ({
    children,
    permissionContext,
    runtime,
}: RaurusProviderProps) => {
    const [editModeEnabled, setEditModeEnabled] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<Awaited<
        ReturnType<typeof runtime.getAsset>
    > | null>(null);
    const [mutationState, setMutationState] =
        useState<RuntimeMutationState>(VIEWER_STATE);

    useEffect(() => {
        let active = true;
        const syncEditMode = async (): Promise<void> => {
            const allowed = await runtime.canEdit(permissionContext);

            if (active) {
                setEditModeEnabled(allowed);
            }
        };

        if (!hasEditQueryParam()) {
            setEditModeEnabled(false);
            return () => {
                active = false;
            };
        }

        void syncEditMode();

        return () => {
            active = false;
        };
    }, [permissionContext, runtime]);

    const refreshAsset = async (id: string) => {
        const asset = await runtime.getAsset(id);

        if (selectedAssetId === id) {
            setSelectedAsset(asset);
        }

        return asset;
    };

    const selectAsset = (id: string) => {
        if (!editModeEnabled) {
            return;
        }

        const syncSelectedAsset = async (): Promise<void> => {
            const asset = await runtime.getAsset(id);
            setSelectedAsset(asset);
        };

        setSelectedAssetId(id);
        void syncSelectedAsset();
    };

    const closeInspector = () => {
        setSelectedAssetId(null);
        setSelectedAsset(null);
        setMutationState(VIEWER_STATE);
    };

    const replaceSelectedAsset = async (file: File) => {
        if (!selectedAssetId) {
            return;
        }

        setMutationState({ errorMessage: null, isPending: true });

        try {
            const asset = await runtime.replaceAsset(
                selectedAssetId,
                file,
                permissionContext
            );

            startTransition(() => {
                setSelectedAsset(asset);
                setMutationState(VIEWER_STATE);
            });
        } catch (error) {
            setMutationState({
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : "Unable to replace asset.",
                isPending: false,
            });
        }
    };

    const removeSelectedAsset = async () => {
        if (!selectedAssetId) {
            return;
        }

        setMutationState({ errorMessage: null, isPending: true });

        try {
            await runtime.removeAsset(selectedAssetId, permissionContext);

            startTransition(() => {
                setSelectedAsset(null);
                setMutationState(VIEWER_STATE);
            });
        } catch (error) {
            setMutationState({
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : "Unable to remove asset.",
                isPending: false,
            });
        }
    };

    return (
        <RaurusContextProvider
            value={{
                closeInspector,
                editModeEnabled,
                getAsset: runtime.getAsset,
                mutationState,
                permissionContext,
                refreshAsset,
                removeSelectedAsset,
                replaceSelectedAsset,
                runtime,
                selectAsset,
                selectedAsset,
                selectedAssetId,
            }}
        >
            {children}
            <RaurusAdminChrome />
        </RaurusContextProvider>
    );
};
