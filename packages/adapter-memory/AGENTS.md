# Package Agent Guide

## Package Context

`@raurus/adapter-memory` provides in-memory implementations of the `RaurusMetadataAdapter` and `RaurusStorageAdapter` contracts from `@raurus/core`. It is useful for development, testing, and as a reference for building custom adapters.

## Architecture

```
src/
├── metadata.ts   # createMemoryMetadataAdapter — Map-based RaurusMetadataAdapter
├── storage.ts    # createMemoryStorageAdapter — Map-based RaurusStorageAdapter
└── index.ts      # Public barrel export
```

## Key Concepts

- Both adapters use `Map` for in-memory storage — data is lost on process restart
- `createMemoryMetadataAdapter()` maps placeholder IDs to `RaurusMetadata` records
- `createMemoryStorageAdapter()` maps asset keys to `Uint8Array` buffers, with a presigned upload URL method returning `memory://` scheme strings
- The storage adapter handles `ArrayBuffer`, `File`, and `Blob` inputs uniformly by converting to `Uint8Array`

## Package Standards

- Keep one adapter per source file
- Export factory functions (not classes) following the core package's factory pattern
- Depend only on `@raurus/core` for type contracts

## Workflow

- `bun run build` bundles with tsdown (ESM + declarations)
- `bun run typecheck` verifies TypeScript compilation
- `bun run test` runs vitest (no tests yet)
