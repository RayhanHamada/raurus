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
│   ├── client-provider.tsx      # RaurusClientProvider — React context provider for editing state
│   └── editable-text.tsx        # Editable text components (Div, Span, H1–H6, A, P)
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
- **RaurusClientProvider** — Context provider managing `editMode`, `selectedId`, `editingId`, and a `placeholders` map. Accepts `url`, `initialData`, and `defaultEditMode` (defaults to `false`).
- **Editable text components** — Factory-pattern generated components (`EditableDiv`, `EditableSpan`, `EditableH1`–`EditableH6`, `EditableLink`) created by `createEditableTextElement()`. Each handles select→edit two-click flow, focus management, and visual state via `data-raurus-*` attributes.
- **Tailwind v4 prefix** — All Tailwind utilities are prefixed with `raurus:` to avoid collisions with consumer stylesheets. CSS is sourced from `./components/` directory.
- **cnfast** — Uses `cnfast` for className merging (not clsx/classnames).

## Package Standards

- Use `@/` path alias for internal imports (configured in tsconfig paths)
- Components use the `FC<PropsWithChildren<Props>>` pattern from React
- Context value follows the `IRaurusContext` interface — extend it when adding new state
- The `useRaurus()` hook throws if called outside `RaurusClientProvider`
- Editable components carry `data-raurus-id`, `data-raurus-edit-mode`, `data-raurus-selected`, and `data-raurus-editing` data attributes for CSS targeting
- Use `suppressContentEditableWarning` on contentEditable elements
- Tailwind classes use the `raurus:` prefix consistently

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
- Vitest config uses `@vitejs/plugin-react` with tsconfig path resolution and `passWithNoTests: true`
- Tests run against a real browser via `@vitest/browser-playwright`
- Storybook is configured with `@storybook/addon-vitest` for running stories as vitest tests (`npx vitest --project storybook run`)
- The Storybook preview wraps all stories in `RaurusClientProvider` and imports the project's Tailwind CSS
- `@tailwindcss/vite` plugin is used in `.storybook/main.ts` `viteFinal` to process Tailwind CSS classes
- MSW (`msw-storybook-addon`) is installed for mock data needs but no handlers are configured yet
- Storybook init boilerplate (`src/stories/`) was removed; real stories are colocated with their components
