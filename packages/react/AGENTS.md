# Package Agent Guide

## Package Context

`@raurus/react` is the React 19 client component library for the Raurus visual editing framework. It provides a context-based editing system with editable HTML elements, shipped as both client and server exports. This package uses Tailwind CSS v4 for styling and bundles CSS via tsdown plugins.

This file extends the root [AGENTS.md](../AGENTS.md).

## Architecture

```
src/
├── client.ts                    # "use client" barrel — re-exports components + hooks + imports CSS
├── server.ts                    # Server-only exports (currently placeholder)
├── index.css                    # Tailwind v4 entry — prefixed with "raurus:" layer
├── components/
│   ├── index.ts                 # Barrel for all components
│   ├── client-provider.tsx      # RaurusClientProvider — React context provider with useState-based state
│   └── editable-field.tsx       # Editable field components (Div, Span, H1–H6, A, P)
├── context/
│   └── index.ts                 # IRaurusContext interface + createContext
├── hooks/
│   ├── index.ts                 # Barrel for hooks
│   └── useRaurus.ts             # useRaurus() hook — accesses IRaurusContext, throws if outside provider
├── common/
│   ├── index.ts                 # Barrel for common types
│   └── types.ts                 # Data, TextContent, ImageContent types
└── css.d.ts                     # CSS module declarations
```

## Key Concepts

- **Dual exports** — `@raurus/react/client` for client components and `@raurus/react/server` for server-only utilities. The `"use client"` directive is in `src/client.ts`, not on individual components.
- **State management** — All editing state (`editMode`, `selectedId`, `editingId`, `placeholders`) is managed via React `useState` in the `RaurusClientProvider` and exposed through React context. Components consume state via `useRaurus()` — there is no external state library. Portal-rendered components (IdTooltip, future overlays) access state through context like any other component.
- **RaurusClientProvider** — Context provider managing all editing state with React `useState` and exposing the `IRaurusContext` interface. Accepts `url` and `editMode` (defaults to `false`). Deselection is handled globally on mousedown events outside `[data-raurus-id]` elements via `useLayoutEffect`.
- **Editable field components** — Factory-pattern generated components (`EditableDiv`, `EditableSpan`, `EditableH1`–`EditableH6`, `EditableLink`) created by `createEditableField()`. Each handles select→edit two-click flow, focus management, hover state, an `IdTooltip` portal overlay showing the component's `id`, and visual state via `data-raurus-*` attributes. The `EditableLink` component prevents default click behavior in edit mode to allow selection without navigation. Each component auto-registers on mount via `registerPlaceholder(id, el.innerHTML)` if its `id` is not already in the placeholder store — this captures the element's initial innerHTML as a `{ type: "text", content: innerHTML }` Data entry. Components seeded via `initialPlaceholders` will not be overwritten.

- **Placeholder ID convention** — Editable components require an `id` prop (enforced by TypeScript via `EditableFieldOwnProps`). IDs are page-local — they only need to be unique within a single page, not globally. Use `kebab-case` descriptive names (e.g., `hero-title`, `nav.cta`, `footer.copyright`). The server's `(placeholder_id, pathname)` composite key handles uniqueness across pages, so the same ID (`hero-title`) can exist on `/` and `/about` with different values. Each `(placeholder_id, pathname)` pair is independent — upserts always replace the existing row. There is no type locking; a placeholder can change type between edits.
- **IdTooltip** — A portal-rendered tooltip that appears above editable elements on hover, select, or edit (when in edit mode). Uses `useLayoutEffect` for position calculation relative to the target element.
- **Tailwind v4 prefix** — All Tailwind utilities are prefixed with `raurus:` to avoid collisions with consumer stylesheets. CSS is sourced from `./components/` directory.
- **cnfast** — Uses `cnfast` for className merging (not clsx/classnames).

## Package Standards

- Use `@/` path alias for internal imports (configured in tsconfig paths)
- Components use the `FC<PropsWithChildren<Props>>` pattern from React
- Context value follows the `IRaurusContext` interface — extend it when adding new state
- The `useRaurus()` hook throws if called outside `RaurusClientProvider`
- Editable components carry `data-raurus-id` (always present), `data-raurus-edit-mode`, `data-raurus-selected`, and `data-raurus-editing` data attributes for CSS targeting and DOM queries
- Use `suppressContentEditableWarning` on contentEditable elements
- Tailwind classes use the `raurus:` prefix consistently
- State is managed in `RaurusClientProvider` via React `useState` — add new state variables there and expose them through the `IRaurusContext` interface
- State is not persisted to localStorage (no persistent state mechanism)
- All components (including portal-rendered) access state through `useRaurus()` via React context

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes
- Build with `bun run build` (tsdown with tailwind + inject-css plugins)
- Run tests with `bun run test` (vitest with browser-playwright)
- Type-check with `bun run typecheck`
- The `play` script runs a Vite dev server for manual testing

## Package Notes

- Build uses tsdown with two entries (`src/client.ts`, `src/server.ts`), exports mode, and PostCSS CSS transformer
- `react` and `react-dom` are configured as `neverBundle` deps in tsdown config
- The `@bosh-code/tsdown-plugin-tailwindcss` and `@bosh-code/tsdown-plugin-inject-css` plugins handle Tailwind v4 compilation and CSS injection in the build output
- Editing state is managed via React `useState` in `RaurusClientProvider` — no external state library is used
- Vitest config uses `@vitejs/plugin-react` with tsconfig path resolution and `passWithNoTests: true`
- Tests run against a real browser via `@vitest/browser-playwright`
- Storybook is configured with `@storybook/addon-vitest` for running stories as vitest tests (`npx vitest --project storybook run`)
- The Storybook preview wraps all stories in `RaurusClientProvider` and imports the project's Tailwind CSS
- Storybook stories must NOT nest additional `RaurusClientProvider` instances — the global preview decorator already provides one
- `@tailwindcss/vite` plugin is used in `.storybook/main.ts` `viteFinal` to process Tailwind CSS classes
- Storybook init boilerplate (`src/stories/`) was removed; real stories are colocated with their components
