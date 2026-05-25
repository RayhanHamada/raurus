# Package Agent Guide

## Package Context

This package is `@raurus/tsconfig`, the shared TypeScript base configuration for Raurus workspaces.

## Package Standards

- Keep the shared config focused on workspace-wide compiler defaults only
- Export the base config as an explicit package entry so other workspaces can extend `@raurus/tsconfig`
- Keep package-specific path aliases in each consuming workspace `tsconfig.json`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Update this file when shared TypeScript configuration conventions or verification expectations change

## Package Notes

- Workspace packages should install `@raurus/tsconfig` and extend it from their local `tsconfig.json`
- Package-specific compiler settings such as `jsx`, `lib`, `types`, `paths`, and `include` stay in the consuming workspace
