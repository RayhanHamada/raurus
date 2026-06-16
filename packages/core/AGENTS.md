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

- **Domain types** — `RaurusMetadata` is a discriminated union keyed by `type` (`"photo" | "text" | "video"`); photo and video variants carry an `assetKey` while text carries a `text` string. `RaurusMetadataType` is the string literal union of those types.
- **Asset type** — `RaurusAsset` is the shared upload input type (`ArrayBuffer | File | Blob`)
- **Common adapter** — `CommonRuntimeAdapter` declares `checkConnection(): Promise<{ ok: boolean; message?: string }>` and is extended by both `RuntimeMetadataAdapter` and `RuntimeStorageAdapter`
- **Metadata Adapter** — `RuntimeMetadataAdapter` extends `CommonRuntimeAdapter` and defines `getMetadataByPlaceholderId`, optional `bulkGetMetadataByPlaceholderIds`, and `upsertContentMetadata` (overloaded for `PhotoMetadata | VideoMetadata` with `assetKey` and for `TextMetadata` with `text`)
- **Storage Adapter** — `RuntimeStorageAdapter` extends `CommonRuntimeAdapter`; currently exposes the optional `createPresignedUploadUrl(assetKey, expiresIn?)` method
- **Base configs** — `RuntimeMetadataAdapterBaseConfig` and `RuntimeStorageAdapterBaseConfig` are empty interfaces that adapter implementations extend to define their own config options
- Factory types use generics over these base configs to preserve concrete adapter configuration types through composition
- Methods not required for all adapter implementations (`bulkGetMetadataByPlaceholderIds`, `createPresignedUploadUrl`) are declared optional

## Package Standards

- Keep all domain types in `@raurus/core` — implementations belong in separate packages
- Prefix adapter contracts and factories with `Runtime` (e.g. `RuntimeMetadataAdapter`, `RuntimeStorageAdapterFactory`)
- Use interfaces for adapter contracts, types for factory functions and discriminated unions
- Provide empty base config interfaces that adapter packages extend
- Place new shared domain models (and their literal-union companions) in `src/types.ts` and re-export them through `src/index.ts`
- The `oxlint-disable typescript/unified-signatures` directive at the top of `types.ts` is intentional — keep it; it preserves the `upsertContentMetadata` overload pair for photo/video vs. text metadata

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (uses tsdown with exports mode)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- This package is currently type-only — all runtime logic lives in other packages
- The current public surface is a single root entry point that re-exports `src/types.ts`
- When adding a new adapter concept, follow the existing factory pattern: `BaseConfig` interface → `Adapter` interface (extending `CommonRuntimeAdapter`) → `Factory` type
- When adding a new metadata variant to `RaurusMetadata`, update `RaurusMetadataType` and add a corresponding `upsertContentMetadata` overload
