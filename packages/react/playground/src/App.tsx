import { useState } from "react";

import { EditableImage, EditableText, EditableVideo, LoginButton, EditOverlay } from "../src";

export function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);

    const placeholderIds = ["hero-headline", "hero-subheadline", "hero-image", "feature-title", "feature-desc"];

    return (
        <div className="min-h-screen bg-white">
            <header className="py-20 text-center">
                <EditableText
                    isEditing={isEditing}
                    isSelected={selectedId === "hero-headline"}
                    text="Build products your users love"
                    as="h1"
                    onClick={() => setSelectedId(selectedId === "hero-headline" ? null : "hero-headline")}
                    className="text-5xl font-bold tracking-tight mb-4"
                />
                <EditableText
                    isEditing={isEditing}
                    isSelected={selectedId === "hero-subheadline"}
                    text="Modern tools for modern teams"
                    as="p"
                    onClick={() => setSelectedId(selectedId === "hero-subheadline" ? null : "hero-subheadline")}
                    className="text-xl text-gray-500"
                />
            </header>

            <section className="max-w-lg mx-auto py-12 px-6">
                <EditableImage
                    isEditing={isEditing}
                    isSelected={selectedId === "hero-image"}
                    src="https://placehold.co/600x400/e5e7eb/a3a3a3?text=Dashboard"
                    onClick={() => setSelectedId(selectedId === "hero-image" ? null : "hero-image")}
                    className="rounded-2xl shadow-lg w-full"
                    alt="Dashboard"
                />
            </section>

            <section className="max-w-lg mx-auto py-12 px-6">
                <EditableVideo
                    isEditing={isEditing}
                    isSelected={selectedId === "hero-video"}
                    src="https://www.w3schools.com/html/mov_bbb.mp4"
                    onClick={() => setSelectedId(selectedId === "hero-video" ? null : "hero-video")}
                    controls
                    className="rounded-2xl shadow-lg w-full"
                />
            </section>

            <LoginButton
                isAuthenticated={isAuthenticated}
                isEditing={isEditing}
                onLogin={async (password) => {
                    await new Promise((r) => setTimeout(r, 500));
                    if (password === "demo") {
                        setIsAuthenticated(true);
                        return true;
                    }
                    return false;
                }}
                onEnterEdit={() => setIsEditing(true)}
                onExitEdit={() => setIsEditing(false)}
                onLogout={() => {
                    setIsAuthenticated(false);
                    setIsEditing(false);
                }}
            />

            {isEditing && (
                <EditOverlay
                    placeholderIds={placeholderIds}
                    selectedPlaceholderId={selectedId}
                    previewSrc={previewSrc}
                    saving={saving}
                    error={error}
                    onSelectPlaceholder={setSelectedId}
                    onClose={() => setIsEditing(false)}
                    onReplaceMedia={() => setSaving(false)}
                    onFileSelect={(file) => {
                        setSaving(true);
                        setTimeout(() => {
                            setPreviewSrc(URL.createObjectURL(file));
                            setSaving(false);
                        }, 500);
                    }}
                    onSaveText={(text) => {
                        setError(null);
                        alert(`Saved text for "${selectedId}": ${text}`);
                    }}
                />
            )}
        </div>
    );
}
