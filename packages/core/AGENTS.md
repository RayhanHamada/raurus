# Package Agent Guide

## Package Context

This package is `@raurus/core`, the framework-agnostic runtime for editable asset orchestration.

## Package Standards

- Keep this package free of React imports, JSX, and DOM rendering concerns
- Keep public exports explicit through `src/index.ts`
- Prefer typed errors and small, focused runtime helpers over broad abstractions
- Preserve tree-shakeability and keep the `tsdown` build focused on the public entrypoint

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Update this file if new runtime conventions or package-specific verification steps are introduced

## Package Notes

- The runtime owns validation, permissions, replacement, removal, and rollback behavior
- Adapter interfaces live here and are implemented by separate packages
