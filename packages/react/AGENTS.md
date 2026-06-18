# Package Agent Guide

## Package Context

This package is `@raurus/react`, a React 19 component library for the Raurus visual editing system. It provides a React context provider, hooks, and editable UI components for in-page content editing. Components are compiled with React Compiler, styled with Tailwind CSS, and browser-tested via vitest-browser + Playwright.

This file extends the root [AGENTS.md](../../AGENTS.md).

## Architecture

```
src/
├── index.ts              # Public barrel — re-exports all components and hooks
├── RaurusProvider.tsx     # React context provider (baseUrl, auth state, edit mode, placeholder registry)
├── useEditMode.ts         # Hook: exposes isEditing, isAuthenticated, enter/exit edit mode, login/logout
├── useContent.ts          # Hook: fetches and updates metadata for a given placeholderId
├── EditableImage.tsx      # Editable <img> with dashed highlight border in edit mode
├── EditableText.tsx       # Editable text element (h1/h2/h3/p/span) with highlight border
├── EditableVideo.tsx      # Editable <video> with highlight border
├── LoginButton.tsx        # Floating button (bottom-right, low opacity) + AuthModal (login/logout)
└── EditOverlay.tsx        # Floating editing panel: placeholder dropdown, media upload, text editing

playground/
├── index.html             # Vite entry for manual dev testing
└── src/
    ├── index.tsx          # Playground app entry
    ├── App.tsx            # Playground app component
    └── style.css          # Playground styles
```

## Key Concepts

- **RaurusProvider** — Wraps the app and provides `baseUrl`, auth state (token in localStorage), editing mode, selected placeholder, and a registry of placeholder IDs. Handles login, token persistence, and edit mode lifecycle.
- **useEditMode()** — Returns `{ isEditing, isAuthenticated, enterEditMode, exitEditMode, login, logout }`. Call `login(password)` to authenticate, then `enterEditMode()` to activate visual editing.
- **useContent(placeholderId)** — Returns `{ content, isLoading, error, update }`. Fetches metadata from `GET /metadata/:placeholderId` on mount. `update(data)` calls `PUT /metadata/:placeholderId`.
- **Editable components** (`EditableImage`, `EditableText`, `EditableVideo`) — In edit mode, render with a dashed border (gray by default, blue when selected). Click to select/deselect. Content falls back to a `fallback` prop when no metadata exists. Asset URLs are constructed as `{baseUrl}/asset-content/{assetKey}`.
- **LoginButton** — Fixed bottom-right, 20% opacity, reveals on hover. Click opens AuthModal for login. When authenticated, offers enter/exit edit mode and logout.
- **EditOverlay** — Fixed bottom-left panel. Only visible when `isEditing`. Contains a dropdown of all registered placeholders, a "Replace Media" button (triggers file upload → PUT metadata), and a textarea with "Save Text" button. Supports both image and video uploads.
- **Styling** — Tailwind CSS classes are statically extracted at build time via `@bosh-code/tsdown-plugin-tailwindcss`. No runtime CSS-in-JS.

## API Surface

```ts
// Provider
export { RaurusProvider, useRaurus };

// Hooks
export { useEditMode };
export { useContent };

// Components
export { EditableImage };
export { EditableText };
export { EditableVideo };
export { LoginButton };
export { EditOverlay };
```

## Consumer Example

```tsx
import { RaurusProvider, EditableImage, EditableText, LoginButton, EditOverlay } from "@raurus/react";

function App() {
    return (
        <RaurusProvider baseUrl="/_raurus">
            <main>
                <EditableImage placeholderId="hero-image" fallback="/default.jpg" />
                <EditableText placeholderId="headline" as="h1" fallback="Welcome" />
                <EditableVideo placeholderId="intro-video" />
            </main>
            <LoginButton />
            <EditOverlay />
        </RaurusProvider>
    );
}
```

## Conventions

- Components use named exports only (no default exports)
- Props are defined as interfaces co-located in the component file
- Hooks are thin wrappers around `useRaurus()` context
- API calls use plain `fetch()` — the `@raurus/client` package is not required by this layer
- Auth token is stored in `localStorage` under key `raurus_token`
- Tailwind classes are used inline for styling; no separate CSS files for components
- `tsconfig.json` extends `@tsconfig/strictest` directly (needs DOM lib, JSX)

## Dependencies

- **Runtime**: `@raurus/core` (workspace) — for type references if needed
- **Peer**: `react` ^19.2.0, `react-dom` ^19.2.0
- **Build**: tsdown with `@rolldown/plugin-babel`, `@bosh-code/tsdown-plugin-inject-css`, `@bosh-code/tsdown-plugin-tailwindcss`
- **Test**: vitest, `@vitest/browser-playwright`, `vitest-browser-react`, `@vitejs/plugin-react`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (tsdown with dts, minify, exports mode)
- Run tests with `bun run test` (vitest with browser provider)
- Type-check with `bun run typecheck`
- Run the playground with `bun run play` (Vite dev server)

## Package Notes

- The RaurusProvider stores the auth token in `localStorage` — survives page refreshes
- `isEditing` is distinct from `isAuthenticated` — even with a valid token, the admin must explicitly enter edit mode
- Editable components register their placeholder IDs on mount — this powers the EditOverlay dropdown
- Asset serving uses `GET /asset-content/:assetKey` which is a public endpoint (no auth). This lets images and videos display for all visitors without authentication.
- Text content goes through `PUT /metadata/:placeholderId` with `{ type: "text", text }`. Media goes through file upload first, then metadata update.
