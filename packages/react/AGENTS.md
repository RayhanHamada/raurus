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
│   ├── client-provider.tsx      # RaurusClientProvider — React context provider wrapping nanostores atoms
│   └── editable-text.tsx        # Editable text components (Div, Span, H1–H6, A, P)
├── context/
│   └── index.ts                 # IRaurusContext interface + createContext
├── hooks/
│   ├── index.ts                 # Barrel for hooks
│   └── useRaurus.ts             # useRaurus() hook — accesses IRaurusContext, throws if outside provider
├── state/
│   ├── index.ts                 # Barrel for state atoms
│   └── atoms.ts                 # nanostores atoms: $editMode, $selectedId, $editingId, $placeholders
├── common/
│   ├── index.ts                 # Barrel for common types
│   └── types.ts                 # Data, TextContent, ImageContent types
└── css.d.ts                     # CSS module declarations
```

## Key Concepts

- **Dual exports** — `@raurus/react/client` for client components and `@raurus/react/server` for server-only utilities. The `"use client"` directive is in `src/client.ts`, not on individual components.
- **State management** — Editing state lives in [nanostores](https://github.com/nanostores/nanostores) atoms (`src/state/atoms.ts`). Persistent state (`$editMode`, `$placeholders`) uses `@nanostores/persistent` with localStorage. Transient state (`$selectedId`, `$editingId`) uses plain `atom()`. The `RaurusClientProvider` subscribes to atoms via `useStore()` and exposes them through React context — components consume state via `useRaurus()`, not atoms directly. Portal-rendered components (IdTooltip, future overlays) can read atoms directly without context.
- **RaurusClientProvider** — Context provider wrapping nanostores atoms and exposing the `IRaurusContext` interface. Accepts `url` and `editMode` (sets `$editMode` via `useState` initializer). Deselection is handled globally on mousedown events outside `[data-raurus-id]` elements.
- **Editable text components** — Factory-pattern generated components (`EditableDiv`, `EditableSpan`, `EditableH1`–`EditableH6`, `EditableLink`) created by `createEditableTextElement()`. Each handles select→edit two-click flow, focus management, hover state, an `IdTooltip` portal overlay showing the component's `id`, and visual state via `data-raurus-*` attributes. The `EditableLink` component prevents default click behavior in edit mode to allow selection without navigation.
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
- State atoms live in `src/state/atoms.ts` — add new atoms there, barrel-export from `src/state/index.ts`
- Persistent state uses `persistentBoolean` / `persistentJSON` from `@nanostores/persistent` with a `"raurus:"` key prefix
- Transient state (selection, editing) uses plain `atom()`
- Direct atom reads (outside context) are allowed for portal-rendered components; context consumers should use `useRaurus()`

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
- `@raurus/client` is a workspace dependency — imported for shared types
- `nanostores` (`^1.4.0`), `@nanostores/react` (`^1.1.0`), and `@nanostores/persistent` (`^1.3.4`) manage editing state — all atoms are in `src/state/atoms.ts`
- Vitest config uses `@vitejs/plugin-react` with tsconfig path resolution and `passWithNoTests: true`
- Tests run against a real browser via `@vitest/browser-playwright`
- Storybook is configured with `@storybook/addon-vitest` for running stories as vitest tests (`npx vitest --project storybook run`)
- The Storybook preview wraps all stories in `RaurusClientProvider` and imports the project's Tailwind CSS
- Storybook stories must NOT nest additional `RaurusClientProvider` instances — the global preview decorator already provides one, and nanostores atoms are global singletons
- `@tailwindcss/vite` plugin is used in `.storybook/main.ts` `viteFinal` to process Tailwind CSS classes
- MSW (`msw-storybook-addon`) is installed for mock data needs but no handlers are configured yet
- Storybook init boilerplate (`src/stories/`) was removed; real stories are colocated with their components
