# Package Agent Guide

## Package Context

`@raurus/adapter-memory` provides in-memory implementations of the `RuntimeMetadataAdapter` and `RuntimeStorageAdapter` contracts from `@raurus/core`. It is useful for development, testing, and as a reference for building custom adapters.

## Architecture

```
src/
├── metadata.ts   # createMemoryMetadataAdapter — Map-based RuntimeMetadataAdapter
├── storage.ts    # createMemoryStorageAdapter — Map-based RuntimeStorageAdapter
└── index.ts      # Public barrel export
```

## Key Concepts

- Both adapters use `Map` for in-memory storage — data is lost on process restart
- `createMemoryMetadataAdapter()` maps placeholder IDs to `RaurusMetadata` records
- `createMemoryStorageAdapter()` maps asset keys to `Uint8Array` buffers
- The storage adapter handles `ArrayBuffer`, `File`, and `Blob` inputs uniformly by converting to `Uint8Array`
- Each adapter extends the base config interface from core (`RuntimeMetadataAdapterBaseConfig` / `RuntimeStorageAdapterBaseConfig`) even when empty, to match the factory contract

## Package Standards

- Keep one adapter per source file
- Export factory functions (not classes) following the core package's `Runtime*AdapterFactory` pattern
- Extend core base config interfaces for adapter configs, even if empty
- Depend only on `@raurus/core` for type contracts
- Use `satisfies Runtime*Adapter` at the return value to catch contract mismatches at compile time

## Workflow

- `bun run build` bundles with tsdown (ESM + declarations)
- `bun run typecheck` verifies TypeScript compilation
- `bun run test` runs vitest (no tests yet)
