# Package Agent Guide

## Package Context

This package is `@raurus/example`, a React-based example package in the Raurus monorepo.

## Package Standards

- Keep the package name aligned with the monorepo naming rule: `@raurus/<package>`
- Keep the package scaffold and build flow based on `tsdown`
- Preserve tree-shakeability by using explicit exports, avoiding unnecessary side effects, and keeping package entrypoints focused
- Keep public exports intentionally defined through `src/index.ts`

## Workflow

- Read the root `AGENTS.md` before planning or implementation work in this package
- Use relevant skills for package work, especially React-related skills for component and JSX tasks
- Use available tools and MCP integrations when they help complete package work effectively
- After implementation tasks in this package, update this `AGENTS.md` when package-specific conventions, structure, or workflows change

## Package Notes

- Source files live under `src/`
- The package currently exposes React components
- Build configuration is defined in `tsdown.config.ts`
