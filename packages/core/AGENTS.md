# Package Agent Guide

## Package Context

This package is `@raurus/core`, the foundation library for the Raurus framework. It defines shared domain types plus adapter contracts for pluggable metadata and storage backends.

## Architecture

The package currently has a flat source layout:

```
src/
├── types.ts      # Shared domain types and adapter contracts
└── index.ts      # Public barrel export
```

## Key Concepts

- **Metadata Adapter** — `RaurusMetadataAdapter` and `RaurusMetadataAdapterFactory` define the placeholder-to-asset metadata contract
- **Storage Adapter** — `RaurusStorageAdapter` and `RaurusStorageAdapterFactory` own asset upload, presigned URL generation, and deletion
- **Raurus Asset** — `RaurusAsset` is the shared upload input type used by storage adapters
- **Raurus Instance** — `RaurusInstance` is the core runtime, constructed via `RaurusFactory` with a `RaurusInstanceConfig` that composes both adapters
- The config and factory types use generics to preserve concrete adapter types through composition

## Package Standards

- Keep all domain types in `@raurus/core` — implementations belong in separate packages
- Keep the public surface on the root package export unless the package is deliberately restructured
- Use interfaces for adapter contracts, types for factory functions
- Keep metadata persistence concerns on `RaurusMetadataAdapter`; presigned URL and asset lifecycle APIs belong on `RaurusStorageAdapter`
- Re-export public types through `src/index.ts`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (uses tsdown with exports mode)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- This package is currently type-only — all runtime logic lives in other packages
- The current public surface is a single root entry point that re-exports `src/types.ts`
- When adding a new adapter concept, follow the existing factory pattern: `Config` interface → `Adapter` interface → `Factory` type
