# Package Agent Guide

## Package Context

This package is `@raurus/client`, the type-safe client SDK for the Raurus framework. It targets both browser and server runtimes and consumes `@raurus/core` types.

This file extends the root [AGENTS.md](../AGENTS.md).

## Architecture

The package is currently a flat barrel:

```
src/
└── index.ts        # Public barrel export
```

## Conventions

- `tsconfig.json` includes the `DOM` lib because the SDK is intended to run in the browser as well as on the server
- `tsdown.config.ts` uses a single `src/index.ts` entry; revisit if the package grows adapters under `src/adapters/*/index.ts`
- Runtime types come from `@raurus/core` — do not duplicate domain types here

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (uses tsdown with exports mode)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`
- Lint and format with `bun run check` / `bun run fix` from the repo root

## Package Notes

- The current public surface is a placeholder `PACKAGE_NAME` constant — replace it with the first real module before publishing
- Add new runtime deps with `workspace:*` for `@raurus/*` packages; confirm any non-Raurus runtime dep before adding it
