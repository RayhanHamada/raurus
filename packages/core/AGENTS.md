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

- **Metadata Adapter** — `RuntimeMetadataAdapter` and `RuntimeMetadataAdapterFactory` define the placeholder-to-asset metadata contract
- **Storage Adapter** — `RuntimeStorageAdapter` and `RuntimeStorageAdapterFactory` own asset upload, presigned URL generation, and deletion
- **Asset type** — `RaurusAsset` is the shared upload input type (`ArrayBuffer | File | Blob`)
- **Base configs** — `RuntimeMetadataAdapterBaseConfig` and `RuntimeStorageAdapterBaseConfig` are empty interfaces that adapter implementations extend to define their own config options
- Factory types use generics over these base configs to preserve concrete adapter configuration types through composition
- Adapter methods that may not be supported by all implementations (`createPresignedUploadUrl`, `uploadAsset`, `deleteAsset`) are declared optional

## Package Standards

- Keep all domain types in `@raurus/core` — implementations belong in separate packages
- Prefix adapter contracts and factories with `Runtime` (e.g. `RuntimeMetadataAdapter`, `RuntimeStorageAdapterFactory`)
- Use interfaces for adapter contracts, types for factory functions
- Provide empty base config interfaces that adapter packages extend
- Re-export public types through `src/index.ts`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (uses tsdown with exports mode)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- This package is currently type-only — all runtime logic lives in other packages
- The current public surface is a single root entry point that re-exports `src/types.ts`
- When adding a new adapter concept, follow the existing factory pattern: `BaseConfig` interface → `Adapter` interface → `Factory` type
