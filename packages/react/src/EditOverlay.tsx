import { useCallback, useRef, useState } from "react";

interface EditOverlayProps {
    placeholderIds: string[];
    selectedPlaceholderId: string | null;
    previewSrc: string | null;
    saving: boolean;
    error: string | null;
    onSelectPlaceholder: (id: string | null) => void;
    onClose: () => void;
    onReplaceMedia: () => void;
    onFileSelect: (file: File) => void;
    onSaveText: (text: string) => void;
}

export function EditOverlay({
    placeholderIds,
    selectedPlaceholderId,
    previewSrc,
    saving,
    error,
    onSelectPlaceholder,
    onClose,
    onReplaceMedia,
    onFileSelect,
    onSaveText,
}: EditOverlayProps) {
    const [text, setText] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 bg-white rounded-2xl shadow-2xl p-6 w-80 max-h-[80vh] overflow-y-auto ring-1 ring-black/5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                            />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Editor</span>
                </div>
                <button
                    aria-label="close editor"
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 flex items-center justify-center transition-colors"
                    title="Close editor"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <select
                value={selectedPlaceholderId ?? ""}
                onChange={(e) => onSelectPlaceholder(e.target.value || null)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4 transition-colors text-gray-700"
            >
                <option value="">Select an element...</option>
                {placeholderIds.map((id) => (
                    <option key={id} value={id}>
                        {id}
                    </option>
                ))}
            </select>

            {selectedPlaceholderId ? (
                <div>
                    <label htmlFor="selected-element" className="block text-xs font-medium text-gray-500 mb-1.5">
                        Selected element
                    </label>
                    <div
                        id="selected-element"
                        className="bg-gray-50 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 mb-4 truncate border border-gray-100"
                    >
                        {selectedPlaceholderId}
                    </div>
                    {previewSrc && (
                        <div className="mb-3">
                            {/\.(?<extension>mp4|webm|mov)$/iu.test(previewSrc) ? (
                                <video src={previewSrc} controls className="w-full rounded" />
                            ) : (
                                <img src={previewSrc} alt="Preview" className="w-full rounded" />
                            )}
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <div className="mb-3">
                        <button
                            type="button"
                            className="w-full inline-flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-2.5 px-4 rounded-xl text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 transition-colors"
                            onClick={() => {
                                handleFile();
                                onReplaceMedia();
                            }}
                            disabled={saving}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                                />
                            </svg>
                            {saving ? "Uploading..." : "Replace Media"}
                        </button>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="text-content" className="block text-xs font-medium text-gray-500 mb-1.5">
                            Text content
                        </label>
                        <textarea
                            id="text-content"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text content..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                        />
                    </div>

                    <button
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 px-4 rounded-xl text-sm font-medium hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-500/20"
                        onClick={() => onSaveText(text)}
                        disabled={saving || !text}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {saving ? "Saving..." : "Save Text"}
                    </button>
                </div>
            ) : (
                <div className="text-center py-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5"
                            />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-500">Click an element on the page</p>
                    <p className="text-xs text-gray-400 mt-0.5">Dashed borders show editable areas</p>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-3 bg-red-50 rounded-lg px-3 py-2">
                    <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
}
