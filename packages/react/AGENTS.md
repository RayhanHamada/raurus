# Package Agent Guide

## Package Context

This package is `@raurus/react`, the thin React integration for the Raurus runtime.

## Package Standards

- Keep business logic in `@raurus/core`; this package should focus on context, hooks, and UI wiring
- Preserve the render-prop API for `EditableAsset` and keep public exports explicit through `src/index.ts`
- Keep admin UI minimal and avoid introducing framework-specific server assumptions
- Keep the package scaffold and build flow based on `tsdown`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Use React-specific guidance for state, rendering, and interaction work
- Update this file when package-specific React conventions or verification expectations change

## Package Notes

- `RaurusProvider` owns edit mode and selected asset state
- `EditableAsset` must remain invisible in viewer mode and lightweight in editor mode
