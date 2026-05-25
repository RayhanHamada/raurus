# Package Agent Guide

## Package Context

This package is `@raurus/react`, the thin React integration for the Raurus runtime.

## Package Standards

- Keep business logic in `@raurus/core`; this package should focus on context, hooks, and UI wiring
- Preserve the render-prop API for `EditableAsset` and keep public exports explicit through `src/index.ts`
- Keep admin UI minimal and avoid introducing framework-specific server assumptions
- Keep the package scaffold and build flow based on `tsdown`
- Ship the package UI stylesheet as an explicit `./styles.css` export, and keep Tailwind prefix/preflight configuration in `src/styles/index.css` instead of a separate Tailwind config file
- Keep source files grouped by area under `src/components`, `src/context`, `src/hooks`, `src/lib`, and `src/provider`
- Compose Tailwind utility `className` values through `src/lib/cn.ts` so package source stays IntelliSense-friendly and the compiled CSS remains package-local

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Use React-specific guidance for state, rendering, and interaction work
- Verify export or packaged asset changes with `bun run --cwd packages/react test`; package output tests cover the shipped `./styles.css` entry and published files
- Update this file when package-specific React conventions or verification expectations change

## Package Notes

- `RaurusProvider` owns edit mode, selected asset state, and the built-in admin chrome
- Edit mode must stay gated by both `?edit=true` and `runtime.canEdit(permissionContext)`
- `EditableAsset` must remain invisible in viewer mode and lightweight in editor mode
