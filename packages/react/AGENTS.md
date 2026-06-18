# Package Agent Guide

## Package Context

This package is `@raurus/react`, a React 19 component library providing styled presentational components for visual editing UIs. Components are compiled with React Compiler, styled with Tailwind CSS, and browser-tested via vitest-browser + Playwright.

This file extends the root [AGENTS.md](../../AGENTS.md).

## Architecture

```
src/
├── index.ts              # Public barrel — re-exports all components
├── EditableImage.tsx      # Editable <img> with dashed highlight border in edit mode
├── EditableText.tsx       # Editable text element (h1/h2/h3/p/span) with highlight border
├── EditableVideo.tsx      # Editable <video> with highlight border
├── LoginButton.tsx        # Floating button (bottom-right) + AuthModal (login/logout form)
└── EditOverlay.tsx        # Floating editing panel: placeholder dropdown, media upload, text editing

playground/
├── index.html             # Vite entry for manual dev testing
└── src/
    ├── index.tsx          # Playground app entry
    ├── App.tsx            # Playground app component
    └── style.css          # Playground styles
```

## Key Concepts

- **Presentational-only** — Components are pure presentational. They receive all state and callbacks via props. No context provider, no hooks for fetching/metadata — consumers manage their own state and API integration.
- **Editable components** (`EditableImage`, `EditableText`, `EditableVideo`) — Accept `isEditing`, `isSelected`, `onClick`, and content props. In edit mode, render with a dashed border (gray by default, blue when selected). In view mode, render normally.
- **LoginButton** — Fixed bottom-right button with indigo styling. Shows "Login" when unauthenticated, "Edit" when authenticated, "Exit Edit" when editing. Clicking opens the AuthModal for login or triggers enter/exit edit mode callbacks.
- **EditOverlay** — Fixed bottom-left panel. Contains a dropdown of placeholder IDs, a "Replace Media" button (triggers file input), and a textarea with "Save Text" button. All actions are passed via props callbacks.
- **Styling** — Tailwind CSS classes are statically extracted at build time via `@bosh-code/tsdown-plugin-tailwindcss`. No runtime CSS-in-JS.

## API Surface

```ts
// Components (all presentational)
export { EditableImage };
export { EditableText };
export { EditableVideo };
export { LoginButton };
export { EditOverlay };
```

## Consumer Example

```tsx
import { useState } from "react";
import { EditableImage, EditableText, LoginButton, EditOverlay } from "@raurus/react";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <>
            <EditableText
                isEditing={isEditing}
                isSelected={selectedId === "headline"}
                text="Welcome"
                as="h1"
                onClick={() => setSelectedId(selectedId === "headline" ? null : "headline")}
            />
            <LoginButton
                isAuthenticated={isAuthenticated}
                isEditing={isEditing}
                onLogin={async (password) => password === "demo"}
                onEnterEdit={() => setIsEditing(true)}
                onExitEdit={() => setIsEditing(false)}
                onLogout={() => {
                    setIsAuthenticated(false);
                    setIsEditing(false);
                }}
            />
            {isEditing && (
                <EditOverlay
                    placeholderIds={["headline"]}
                    selectedPlaceholderId={selectedId}
                    previewSrc={null}
                    saving={false}
                    error={null}
                    onSelectPlaceholder={setSelectedId}
                    onClose={() => setIsEditing(false)}
                    onReplaceMedia={() => {}}
                    onFileSelect={(file) => {
                        /* upload file */
                    }}
                    onSaveText={(text) => {
                        /* save text */
                    }}
                />
            )}
        </>
    );
}
```

## Conventions

- Components use named exports only (no default exports)
- Props are defined as interfaces co-located in the component file
- No context providers, no data fetching hooks — components are pure presentational
- Tailwind classes are used inline for styling; no separate CSS files for components
- `tsconfig.json` extends `@tsconfig/strictest` directly (needs DOM lib, JSX)

## Dependencies

- **Peer**: `react` ^19.2.0, `react-dom` ^19.2.0
- **Build**: tsdown with `@rolldown/plugin-babel`, `@bosh-code/tsdown-plugin-inject-css`, `@bosh-code/tsdown-plugin-tailwindcss`
- **Test**: vitest, `@vitest/browser-playwright`, `vitest-browser-react`, `@vitejs/plugin-react`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (tsdown with dts, minify, exports mode)
- Run tests with `bun run test` (vitest with browser provider)
- Type-check with `bun run typecheck`
- Run the playground with `bun run play` (Vite dev server)
