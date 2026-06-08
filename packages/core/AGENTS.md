# Package Agent Guide

## Package Context

This package is `@raurus/core`, the foundation library for the Raurus framework. It defines adapter interfaces and types for pluggable metadata and storage backends.

## Architecture

The package has a dual entry point architecture:

- `@raurus/core/client` — client-side types and interfaces
- `@raurus/core/server` — server-side adapter interfaces (metadata, storage, factory patterns)

Source is organized under `src/client/` and `src/server/`, with each directory having its own `index.ts` barrel file.

## Key Concepts

- **Metadata Adapter** — `RaurusMetadataAdapter` and `RaurusMetadataAdapterFactory` define the pluggable interface for metadata backends
- **Storage Adapter** — `RaurusStorageAdapter` and `RaurusStorageAdapterFactory` define the pluggable interface for storage backends
- **Raurus Instance** — `RaurusInstance` is the core runtime, constructed via `RaurusFactory` with a `RaurusInstanceConfig` that composes both adapters
- The config and factory types use generics to preserve concrete adapter types through composition

## Package Standards

- Keep all domain types in `@raurus/core` — implementations belong in separate packages
- Maintain the client/server barrel structure when adding new exports
- Use interfaces for adapter contracts, types for factory functions
- Export types from the appropriate subpath (`./client` or `./server`), not from the package root

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (uses tsdown with exports mode)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- This package is currently type-only — all runtime logic lives in other packages
- The build outputs separate `dist/client/` and `dist/server/` directories matching the entry points
- When adding a new adapter concept, follow the existing factory pattern: `Config` interface → `Adapter` interface → `Factory` type
