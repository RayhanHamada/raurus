const codeStyle = {
    background: "#0f172a",
    borderRadius: 18,
    color: "#e2e8f0",
    fontFamily: "monospace",
    fontSize: "0.95rem",
    overflowX: "auto",
    padding: 20,
} as const;

const setupExample = `import { createRaurusRuntime } from "@raurus/core";
import { sqliteMetadataAdapter } from "@raurus/metadata-sqlite";
import { basicPermissions } from "@raurus/permissions-basic";
import { localStorageAdapter } from "@raurus/storage-local";

const runtime = createRaurusRuntime({
    storage: localStorageAdapter({
        uploadDir: "./public/uploads",
        publicBaseUrl: "/uploads",
    }),
    metadata: sqliteMetadataAdapter({
        dbPath: "./raurus.db",
    }),
    permissions: basicPermissions({
        canEdit: async () => true,
    }),
});`;

const usageExample = `<RaurusProvider runtime={runtime}>
    <EditableAsset id="homepage.hero.banner">
        {({ asset, edit }) => (
            <img
                src={asset?.url ?? "/hero-default.svg"}
                onClick={edit}
            />
        )}
    </EditableAsset>
</RaurusProvider>`;

export const App = () => (
    <main
        style={{
            background: "linear-gradient(180deg, #020617 0%, #111827 100%)",
            color: "#f8fafc",
            minHeight: "100vh",
            padding: "56px 24px 96px",
        }}
    >
        <div style={{ margin: "0 auto", maxWidth: 980 }}>
            <header
                style={{
                    display: "grid",
                    gap: 18,
                    marginBottom: 48,
                }}
            >
                <p
                    style={{
                        color: "#60a5fa",
                        margin: 0,
                        textTransform: "uppercase",
                    }}
                >
                    Raurus V0 Docs
                </p>
                <h1
                    style={{
                        fontSize: "clamp(2.8rem, 7vw, 5rem)",
                        margin: 0,
                    }}
                >
                    Inline frontend asset editing for React apps.
                </h1>
                <p
                    style={{
                        color: "#cbd5e1",
                        lineHeight: 1.8,
                        margin: 0,
                        maxWidth: 720,
                    }}
                >
                    Raurus keeps developers in control of rendering, storage,
                    and styling. V0 focuses on React, image replacement, local
                    filesystem storage, SQLite metadata persistence, and a
                    simple permission callback.
                </p>
            </header>

            <section style={{ display: "grid", gap: 20, marginBottom: 40 }}>
                <h2 style={{ margin: 0 }}>Install the V0 packages</h2>
                <pre
                    style={codeStyle}
                >{`bun add @raurus/core @raurus/react @raurus/storage-local @raurus/metadata-sqlite @raurus/permissions-basic`}</pre>
            </section>

            <section style={{ display: "grid", gap: 20, marginBottom: 40 }}>
                <h2 style={{ margin: 0 }}>Create the runtime</h2>
                <pre style={codeStyle}>{setupExample}</pre>
            </section>

            <section style={{ display: "grid", gap: 20, marginBottom: 40 }}>
                <h2 style={{ margin: 0 }}>Wrap an editable image</h2>
                <pre style={codeStyle}>{usageExample}</pre>
            </section>

            <section
                style={{
                    background: "rgba(15, 23, 42, 0.72)",
                    border: "1px solid rgba(96, 165, 250, 0.2)",
                    borderRadius: 24,
                    display: "grid",
                    gap: 14,
                    padding: 24,
                }}
            >
                <h2 style={{ margin: 0 }}>V0 editing flow</h2>
                <ol style={{ lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
                    <li>
                        Visit your app with <code>?edit=true</code>.
                    </li>
                    <li>
                        Raurus checks `runtime.canEdit()` before exposing any
                        editor UI.
                    </li>
                    <li>
                        Select an editable image to open the inspector drawer.
                    </li>
                    <li>
                        Upload a replacement image or remove the current asset
                        mapping.
                    </li>
                    <li>
                        Refresh the page to verify SQLite metadata and local
                        uploads persist.
                    </li>
                </ol>
                <p style={{ color: "#cbd5e1", lineHeight: 1.8, margin: 0 }}>
                    V0 intentionally excludes videos, rich text, cloud storage,
                    auth systems, drafts, version history, and drag-drop
                    editing.
                </p>
            </section>
        </div>
    </main>
);
