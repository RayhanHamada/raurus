import { useCallback, useRef, useState } from "react";

import { useRaurus } from "./RaurusProvider";

export function EditOverlay() {
    const { baseUrl, isEditing, selectedPlaceholderId, placeholderIds, selectPlaceholder, exitEditMode } = useRaurus();
    const [text, setText] = useState("");
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const token = typeof window === "undefined" ? null : window.localStorage.getItem("raurus_token");

    if (!isEditing) {
        return null;
    }

    const handleSaveText = async () => {
        if (!selectedPlaceholderId || !token) {
            return;
        }
        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`${baseUrl}/metadata/${encodeURIComponent(selectedPlaceholderId)}`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ type: "text", text }),
            });

            if (!response.ok) {
                const json = await response.json();
                setError(json.error ?? "Failed to save");
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedPlaceholderId || !token) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const form = new FormData();
            form.append("files", file);

            const uploadResponse = await fetch(`${baseUrl}/upload-asset`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });

            if (!uploadResponse.ok) {
                const json = await uploadResponse.json();
                setError(json.error ?? "Upload failed");
                setSaving(false);
                return;
            }

            const uploadJson = await uploadResponse.json();
            const { assetKey } = uploadJson.data;
            const type = file.type.startsWith("video/") ? "video" : "photo";

            const metadataResponse = await fetch(`${baseUrl}/metadata/${encodeURIComponent(selectedPlaceholderId)}`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ type, assetKey }),
            });

            if (metadataResponse.ok) {
                setPreviewSrc(`${baseUrl}/asset-content/${encodeURIComponent(assetKey)}`);
            } else {
                const json = await metadataResponse.json();
                setError(json.error ?? "Failed to update metadata");
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setSaving(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleFile = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-white shadow-xl rounded-lg p-4 w-80 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <select
                        value={selectedPlaceholderId ?? ""}
                        onChange={(e) => selectPlaceholder(e.target.value || null)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select element...</option>
                        {placeholderIds.map((id) => (
                            <option key={id} value={id}>
                                {id}
                            </option>
                        ))}
                    </select>
                    {selectedPlaceholderId && <span className="text-xs text-gray-400">{selectedPlaceholderId}</span>}
                </div>
                <button
                    type="button"
                    onClick={exitEditMode}
                    className="text-gray-400 hover:text-gray-600"
                    title="Close editor"
                >
                    <span className="text-lg leading-none">&times;</span>
                </button>
            </div>

            {selectedPlaceholderId ? (
                <div>
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
                        onChange={handleFileSelect}
                    />

                    <div className="mb-3">
                        <button
                            type="button"
                            className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
                            onClick={handleFile}
                            disabled={saving}
                        >
                            {saving ? "Uploading..." : "Replace Media"}
                        </button>
                    </div>

                    <div className="mb-3">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text content..."
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="button"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                        onClick={handleSaveText}
                        disabled={saving || !text}
                    >
                        {saving ? "Saving..." : "Save Text"}
                    </button>
                </div>
            ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                    Click an editable element on the page to start editing.
                </p>
            )}

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
    );
}
