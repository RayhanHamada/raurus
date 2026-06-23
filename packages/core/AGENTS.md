# Package Agent Guide

## Package Context

This package is `@raurus/core`, the foundation library for the Raurus framework. It defines shared domain types plus adapter contracts for pluggable metadata and storage backends.

## Architecture

The package currently has a flat source layout:

```
src/
├── types.ts        # Shared domain types and adapter contracts
├── types.test.ts   # Vitest type tests covering the public type surface
└── index.ts        # Public barrel export
```

## Key Concepts

- **Domain types** — `RaurusMetadata` is a discriminated union keyed by `type` (`"photo" | "text" | "video"`); photo and video variants carry an `assetKey` while text carries a `text` string. The string-literal type aliases are `PhotoMetadataType`, `TextMetadataType`, and `VideoMetadataType` (named `*Type` so they read as the value of the `type` discriminant, not as a record). `RaurusMetadataType` is the string literal union of those three.
- **Asset type** — `RaurusAsset` is `ArrayBuffer`. The previous `ArrayBuffer | File | Blob` union was removed because `File` and `Blob` are DOM types and forced a DOM lib dependency on the server; consumers that have a `File`/`Blob` should call `.arrayBuffer()` first and pass the buffer.
- **Adapter result** — `AdapterMethodResult<T>` is a discriminated union of `Success<T> | Failure` and is the return shape of every adapter method. `Success<T>`, `Failure`, and `FailureCode` are all exported. `Failure` carries an optional `code: FailureCode` for machine-readable failure classification (e.g. `NOT_FOUND` vs `CONNECTION`); consumers should fall back to `UNKNOWN` when `code` is absent.
- **Failure codes** — `FailureCode` enumerates `NOT_IMPLEMENTED`, `NOT_FOUND`, `CONFLICT`, `CONFIGURATION`, `CONNECTION`, `PERMISSION`, `RATE_LIMIT`, `UPSTREAM`, `INVALID_INPUT`, and `UNKNOWN`. Adapter implementations should pick the most specific code that applies.
- **Common adapter** — `CommonRuntimeAdapter` declares `apiVersion: "1"` and `checkConnection(): Promise<AdapterMethodResult<null>>` and is extended by `RuntimeDatabaseAdapter` and `RuntimeStorageAdapter`. `apiVersion` is a string literal so a future v2 can be brandable and survives JSON round-trips.
- **Database Adapter** — `RuntimeDatabaseAdapter` extends `CommonRuntimeAdapter` and defines `id` (template literal `${Lowercase<string>}-database-adapter`), `getMetadata`, `bulkGetMetadataByPlaceholderIds` (now **required**), and the two `upsertContentMetadata` overloads (photo/video with `assetKey`, text with `text`).
- **Storage Adapter** — `RuntimeStorageAdapter` extends `CommonRuntimeAdapter` and exposes a five-method menu, all optional: `uploadAsset(assetKey, RaurusAsset)`, `createPresignedUploadUrl(assetKey, expiresIn?)`, `createPresignedDownloadUrl(assetKey, expiresIn?)`, `deleteAsset(assetKey)`, and `getAssetContent(assetKey)` (returns `{ data: ArrayBuffer; contentType: string }`). Each method returns `AdapterMethodResult<...>`.
- **Base configs** — `RuntimeDatabaseAdapterBaseConfig` and `RuntimeStorageAdapterBaseConfig` are empty interfaces that adapter implementations extend to define their own config options.
- **Factory types** — `RuntimeDatabaseAdapterFactory` and `RuntimeStorageAdapterFactory` are generic over `Config` (preserving concrete adapter configuration types through composition). They return the corresponding adapter interface directly — no phantom brand.
- **Adapter id helpers** — `RaurusDatabaseAdapterId` and `RaurusStorageAdapterId` are named template literal types used on each adapter interface's `id` field (e.g. `RuntimeDatabaseAdapter.id: RaurusDatabaseAdapterId`). They are `export`ed so consumers can reference them without re-declaring the pattern.

## Package Standards

- Keep all domain types in `@raurus/core` — implementations belong in separate packages
- Prefix adapter contracts and factories with `Runtime` (e.g. `RuntimeDatabaseAdapter`, `RuntimeStorageAdapterFactory`)
- Use interfaces for adapter contracts, types for factory functions and discriminated unions
- Provide empty base config interfaces that adapter packages extend
- Place new shared domain models (and their literal-union companions) in `src/types.ts` and re-export them through `src/index.ts`
- Suffix the `RaurusMetadata` literal-type aliases with `Type` (e.g. `PhotoMetadataType`) — they describe the value of the `type` discriminant, not a record
- `RaurusAsset` is `ArrayBuffer` only — do not reintroduce `File | Blob`; the package targets non-DOM runtimes
- `tsconfig.json` for this package does not include the `DOM` lib; keep it that way
- The `oxlint-disable typescript/unified-signatures` directive at the top of `types.ts` is intentional — keep it; it preserves the `upsertContentMetadata` overload pair for photo/video vs. text metadata
- Every adapter implementation must set `apiVersion: "1"` and may set `code: FailureCode` on `Failure` results to participate in the server's HTTP status mapping

## Testing

- This package is type-only, so tests are type assertions using Vitest's `expectTypeOf` — colocate them as `*.test.ts` next to the source they cover
- Mirror the structure of the public surface: domain types, discriminated unions, result helpers, each adapter contract, and the factory generics
- When adding a new public type, add a focused `it(...)` block in `src/types.test.ts` that pins its shape, narrowing, and (where relevant) callable signature
- Use module-scope helper factories (e.g. `makeMetadataAdapter`) inside type tests rather than re-declaring fake adapters per case
- Avoid naming `describe(...)` blocks after imported symbols — the `vitest/prefer-describe-function-title` rule flags matches against imported names
- The new `FailureCode`, `apiVersion`, `RaurusAsset = ArrayBuffer`, `bulkGetMetadataByPlaceholderIds` (required), the three new storage methods, and the adapter template literal `id` types are all pinned in `src/types.test.ts`; keep the assertions in sync when changing the public surface

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (uses tsdown with exports mode)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- This package is currently type-only — all runtime logic lives in other packages
- The current public surface is a single root entry point that re-exports `src/types.ts`
- When adding a new adapter concept, follow the existing factory pattern: `BaseConfig` interface → `Adapter` interface (extending `CommonRuntimeAdapter`) → `Factory` type
- When adding a new metadata variant to `RaurusMetadata`, add a new `*MetadataType` alias, extend `RaurusMetadataType`, extend the `RaurusMetadata` union, and add a corresponding `upsertContentMetadata` overload on `RuntimeDatabaseAdapter`
- When adding a new `FailureCode` value, document the HTTP status mapping guidance for `@raurus/server`'s `failureCodeToStatus` helper
Status` helper
