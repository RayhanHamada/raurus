import { useId } from "react";

import { useRaurusContext } from "./context";

const toolbarButtonStyle = {
    background: "#eff6ff",
    border: "none",
    borderRadius: 999,
    color: "#1d4ed8",
    cursor: "pointer",
    padding: "8px 12px",
} as const;

const secondaryButtonStyle = {
    background: "#fee2e2",
    border: "none",
    borderRadius: 999,
    color: "#b91c1c",
    cursor: "pointer",
    padding: "10px 14px",
} as const;

const actionLabelStyle = {
    color: "#0f172a",
    fontWeight: 600,
} as const;

const labelStyle = {
    color: "#64748b",
    fontSize: 12,
    margin: "0 0 6px",
    textTransform: "uppercase",
} as const;

export const RaurusAdminChrome = () => {
    const {
        closeInspector,
        editModeEnabled,
        mutationState,
        removeSelectedAsset,
        replaceSelectedAsset,
        selectedAsset,
        selectedAssetId,
    } = useRaurusContext();
    const inputId = useId();

    if (!editModeEnabled) {
        return null;
    }

    return (
        <>
            <div
                style={{
                    alignItems: "center",
                    background: "rgba(17, 24, 39, 0.92)",
                    borderRadius: 999,
                    bottom: 24,
                    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.35)",
                    color: "#f8fafc",
                    display: "flex",
                    gap: 12,
                    left: 24,
                    padding: "10px 16px",
                    position: "fixed",
                    zIndex: 50,
                }}
            >
                <strong>Editing Mode</strong>
                {selectedAssetId ? <span>{selectedAssetId}</span> : null}
                <button
                    onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.delete("edit");
                        window.location.href = url.toString();
                    }}
                    style={toolbarButtonStyle}
                    type="button"
                >
                    Exit
                </button>
            </div>

            {selectedAssetId ? (
                <aside
                    aria-label="Raurus Inspector"
                    style={{
                        background: "#ffffff",
                        borderLeft: "1px solid rgba(15, 23, 42, 0.08)",
                        boxShadow: "-18px 0 48px rgba(15, 23, 42, 0.12)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        inset: "0 0 0 auto",
                        padding: 24,
                        position: "fixed",
                        width: 360,
                        zIndex: 45,
                    }}
                >
                    <div>
                        <p style={labelStyle}>Asset ID</p>
                        <strong>{selectedAssetId}</strong>
                    </div>

                    <div>
                        <p style={labelStyle}>Preview</p>
                        {selectedAsset ? (
                            <img
                                alt={selectedAssetId}
                                src={selectedAsset.url}
                                style={{
                                    aspectRatio: "4 / 3",
                                    borderRadius: 16,
                                    objectFit: "cover",
                                    width: "100%",
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    alignItems: "center",
                                    aspectRatio: "4 / 3",
                                    background: "#e2e8f0",
                                    borderRadius: 16,
                                    color: "#475569",
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                No asset uploaded yet
                            </div>
                        )}
                    </div>

                    <label htmlFor={inputId} style={actionLabelStyle}>
                        Upload replacement
                    </label>
                    <input
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        aria-label="Upload replacement"
                        id={inputId}
                        onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (!file) {
                                return;
                            }

                            void replaceSelectedAsset(file);
                            event.currentTarget.value = "";
                        }}
                        type="file"
                    />

                    <button
                        onClick={() => {
                            void removeSelectedAsset();
                        }}
                        style={secondaryButtonStyle}
                        type="button"
                    >
                        Remove asset
                    </button>
                    <button
                        onClick={closeInspector}
                        style={toolbarButtonStyle}
                        type="button"
                    >
                        Close
                    </button>

                    {mutationState.isPending ? <p>Saving...</p> : null}
                    {mutationState.errorMessage ? (
                        <p style={{ color: "#b91c1c", margin: 0 }}>
                            {mutationState.errorMessage}
                        </p>
                    ) : null}
                </aside>
            ) : null}
        </>
    );
};
