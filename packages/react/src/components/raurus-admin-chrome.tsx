"use client";

import { useId } from "react";

import { useRaurusContext } from "@/context/raurus-context";

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
            <div className="raurus:fixed raurus:bottom-6 raurus:left-6 raurus:z-50 raurus:flex raurus:max-w-[calc(100vw-3rem)] raurus:items-center raurus:gap-3 raurus:rounded-full raurus:bg-[rgba(17,24,39,0.92)] raurus:px-4 raurus:py-2.5 raurus:text-slate-50 raurus:shadow-[0_12px_32px_rgba(15,23,42,0.35)]">
                <strong>Editing Mode</strong>
                {selectedAssetId ? (
                    <span className="raurus:max-w-64 raurus:truncate raurus:text-sm raurus:text-slate-300">
                        {selectedAssetId}
                    </span>
                ) : null}
                <button
                    className="raurus:rounded-full raurus:border-0 raurus:bg-blue-50 raurus:px-3 raurus:py-2 raurus:text-sm raurus:font-medium raurus:text-blue-700 raurus:transition-colors raurus:hover:bg-blue-100 raurus:focus-visible:outline-none raurus:focus-visible:ring-2 raurus:focus-visible:ring-blue-600 raurus:focus-visible:ring-offset-2"
                    onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.delete("edit");
                        window.location.href = url.toString();
                    }}
                    type="button"
                >
                    Exit
                </button>
            </div>

            {selectedAssetId ? (
                <aside
                    aria-label="Raurus Inspector"
                    className="raurus:fixed raurus:inset-y-0 raurus:right-0 raurus:z-40 raurus:flex raurus:w-90 raurus:max-w-[calc(100vw-1.5rem)] raurus:flex-col raurus:gap-4 raurus:border-l raurus:border-slate-200/80 raurus:bg-white raurus:p-6 raurus:text-slate-950 raurus:shadow-[-18px_0_48px_rgba(15,23,42,0.12)]"
                >
                    <div>
                        <p className="raurus:mb-1.5 raurus:text-xs raurus:font-semibold raurus:uppercase raurus:tracking-[0.2em] raurus:text-slate-500">
                            Asset ID
                        </p>
                        <strong>{selectedAssetId}</strong>
                    </div>

                    <div>
                        <p className="raurus:mb-1.5 raurus:text-xs raurus:font-semibold raurus:uppercase raurus:tracking-[0.2em] raurus:text-slate-500">
                            Preview
                        </p>
                        {selectedAsset ? (
                            <img
                                alt={selectedAssetId}
                                className="raurus:aspect-4/3 raurus:w-full raurus:rounded-2xl raurus:object-cover"
                                src={selectedAsset.url}
                            />
                        ) : (
                            <div className="raurus:flex raurus:aspect-4/3 raurus:items-center raurus:justify-center raurus:rounded-2xl raurus:bg-slate-200 raurus:text-sm raurus:text-slate-600">
                                No asset uploaded yet
                            </div>
                        )}
                    </div>

                    <label
                        className="raurus:text-sm raurus:font-semibold raurus:text-slate-900"
                        htmlFor={inputId}
                    >
                        Upload replacement
                    </label>
                    <input
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        aria-label="Upload replacement"
                        className="raurus:block raurus:w-full raurus:rounded-xl raurus:border raurus:border-slate-200 raurus:bg-white raurus:px-3 raurus:py-2 raurus:text-sm raurus:text-slate-950 raurus:file:mr-3 raurus:file:rounded-full raurus:file:border-0 raurus:file:bg-blue-50 raurus:file:px-3 raurus:file:py-1.5 raurus:file:text-sm raurus:file:font-medium raurus:file:text-blue-700 raurus:focus-visible:outline-none raurus:focus-visible:ring-2 raurus:focus-visible:ring-blue-600 raurus:focus-visible:ring-offset-2"
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
                        className="raurus:rounded-full raurus:border-0 raurus:bg-red-100 raurus:px-3.5 raurus:py-2.5 raurus:text-sm raurus:font-medium raurus:text-red-700 raurus:transition-colors raurus:hover:bg-red-200 raurus:focus-visible:outline-none raurus:focus-visible:ring-2 raurus:focus-visible:ring-red-600 raurus:focus-visible:ring-offset-2"
                        onClick={() => {
                            void removeSelectedAsset();
                        }}
                        type="button"
                    >
                        Remove asset
                    </button>
                    <button
                        className="raurus:rounded-full raurus:border-0 raurus:bg-blue-50 raurus:px-3 raurus:py-2 raurus:text-sm raurus:font-medium raurus:text-blue-700 raurus:transition-colors raurus:hover:bg-blue-100 raurus:focus-visible:outline-none raurus:focus-visible:ring-2 raurus:focus-visible:ring-blue-600 raurus:focus-visible:ring-offset-2"
                        onClick={closeInspector}
                        type="button"
                    >
                        Close
                    </button>

                    {mutationState.isPending ? (
                        <p className="raurus:m-0 raurus:text-sm raurus:text-slate-600">
                            Saving...
                        </p>
                    ) : null}
                    {mutationState.errorMessage ? (
                        <p className="raurus:m-0 raurus:text-sm raurus:text-red-700">
                            {mutationState.errorMessage}
                        </p>
                    ) : null}
                </aside>
            ) : null}
        </>
    );
};
