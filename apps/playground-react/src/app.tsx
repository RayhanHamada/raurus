import { EditableAsset, RaurusProvider } from "@raurus/react";

import { playgroundRuntime } from "./runtime";

const sectionHeadingStyle = {
    fontSize: "0.95rem",
    letterSpacing: "0.08em",
    marginBottom: 12,
    textTransform: "uppercase",
} as const;

const cardStyle = {
    backdropFilter: "blur(22px)",
    background: "rgba(255, 255, 255, 0.82)",
    border: "1px solid rgba(148, 163, 184, 0.24)",
    borderRadius: 28,
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
    padding: 28,
} as const;

const actionLinkStyle = {
    background: "#2563eb",
    borderRadius: 999,
    color: "#ffffff",
    padding: "12px 18px",
    textDecoration: "none",
} as const;

const secondaryLinkStyle = {
    background: "#eff6ff",
    borderRadius: 999,
    color: "#1d4ed8",
    padding: "12px 18px",
    textDecoration: "none",
} as const;

export const App = () => {
    const editUrl = new URL(window.location.href);
    editUrl.searchParams.set("edit", "true");

    return (
        <RaurusProvider runtime={playgroundRuntime}>
            <main
                style={{
                    background:
                        "radial-gradient(circle at top right, rgba(29, 78, 216, 0.18), transparent 32%), linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
                    color: "#0f172a",
                    minHeight: "100vh",
                    padding: "48px 24px 96px",
                }}
            >
                <div
                    style={{
                        margin: "0 auto",
                        maxWidth: 1180,
                    }}
                >
                    <section
                        style={{
                            display: "grid",
                            gap: 24,
                            gridTemplateColumns:
                                "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
                        }}
                    >
                        <div style={cardStyle}>
                            <p style={sectionHeadingStyle}>Playground</p>
                            <h1
                                style={{
                                    fontSize: "clamp(2.8rem, 6vw, 4.6rem)",
                                    lineHeight: 1,
                                    margin: "0 0 18px",
                                }}
                            >
                                Inline image editing without handing your UI to
                                a CMS.
                            </h1>
                            <p
                                style={{
                                    color: "#334155",
                                    fontSize: "1.05rem",
                                    lineHeight: 1.7,
                                    marginBottom: 22,
                                    maxWidth: 540,
                                }}
                            >
                                This playground proves the V0 path: wrap a
                                frontend image, visit the app with{" "}
                                <code>?edit=true</code>, replace the asset,
                                refresh the page, and keep the updated image.
                            </p>
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 14,
                                }}
                            >
                                <a
                                    href={editUrl.toString()}
                                    style={actionLinkStyle}
                                >
                                    Enter edit mode
                                </a>
                                <a
                                    href={window.location.pathname}
                                    style={secondaryLinkStyle}
                                >
                                    View normal mode
                                </a>
                            </div>
                        </div>

                        <div
                            style={{
                                ...cardStyle,
                                background:
                                    "linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.88))",
                                color: "#f8fafc",
                            }}
                        >
                            <p
                                style={{
                                    ...sectionHeadingStyle,
                                    color: "#93c5fd",
                                }}
                            >
                                Success Criteria
                            </p>
                            <ol
                                style={{
                                    display: "grid",
                                    gap: 14,
                                    lineHeight: 1.6,
                                    margin: 0,
                                    paddingLeft: 20,
                                }}
                            >
                                <li>Open the hero or logo in edit mode.</li>
                                <li>
                                    Upload a replacement image from the
                                    inspector.
                                </li>
                                <li>
                                    Refresh the page to confirm metadata
                                    persistence.
                                </li>
                                <li>
                                    Remove an asset to verify fallback
                                    rendering.
                                </li>
                            </ol>
                        </div>
                    </section>

                    <section
                        style={{
                            alignItems: "start",
                            display: "grid",
                            gap: 24,
                            gridTemplateColumns: "minmax(0, 1fr) 360px",
                            marginTop: 24,
                        }}
                    >
                        <EditableAsset id="homepage.hero.banner">
                            {({ asset, edit, isAdmin, isSelected }) => (
                                <button
                                    onClick={edit}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: isAdmin ? "pointer" : "default",
                                        display: "block",
                                        padding: 0,
                                        textAlign: "left",
                                        width: "100%",
                                    }}
                                    type="button"
                                >
                                    <img
                                        alt="Raurus hero asset"
                                        src={asset?.url ?? "/hero-default.svg"}
                                        style={{
                                            borderRadius: 28,
                                            boxShadow: isSelected
                                                ? "0 0 0 4px rgba(37, 99, 235, 0.28)"
                                                : "0 20px 40px rgba(15, 23, 42, 0.18)",
                                            display: "block",
                                            objectFit: "cover",
                                            width: "100%",
                                        }}
                                    />
                                </button>
                            )}
                        </EditableAsset>

                        <div style={cardStyle}>
                            <p style={sectionHeadingStyle}>Editable logo</p>
                            <EditableAsset id="brand.primary.logo">
                                {({ asset, edit, isAdmin }) => (
                                    <button
                                        onClick={edit}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            cursor: isAdmin
                                                ? "pointer"
                                                : "default",
                                            display: "block",
                                            padding: 0,
                                            width: "100%",
                                        }}
                                        type="button"
                                    >
                                        <img
                                            alt="Raurus logo asset"
                                            src={
                                                asset?.url ??
                                                "/logo-default.svg"
                                            }
                                            style={{
                                                borderRadius: 20,
                                                display: "block",
                                                width: "100%",
                                            }}
                                        />
                                    </button>
                                )}
                            </EditableAsset>

                            <div
                                style={{
                                    color: "#475569",
                                    lineHeight: 1.7,
                                    marginTop: 18,
                                }}
                            >
                                <p>
                                    Files land in <code>public/uploads/</code>{" "}
                                    and metadata is written to{" "}
                                    <code>raurus.db</code>.
                                </p>
                                <p style={{ marginBottom: 0 }}>
                                    Replace either asset, then refresh to verify
                                    the persisted URL is read back through the
                                    runtime.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </RaurusProvider>
    );
};
