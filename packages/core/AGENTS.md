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

- **Domain types** — `RaurusMetadata` is a discriminated union discriminating on `type` (`"photo" | "text" | "video"`). Photo and video share a single branch (both carry `assetKey`), while text carries a `text` string. The string-literal type aliases are `PhotoMetadataType`, `TextMetadataType`, and `VideoMetadataType` (named `*Type` so they read as the value of the `type` discriminant, not as a record). `RaurusMetadataType` is the string literal union of those three.
- **Constants** — `FAILURE_CODES` and `METADATA_TYPES` are `as const` objects in `src/constants.ts`, re-exported through `src/index.ts`. Adapter implementations use `FAILURE_CODES.NOT_FOUND` etc. and metadata consumers use `METADATA_TYPES.PHOTO` / `METADATA_TYPES.TEXT` / `METADATA_TYPES.VIDEO` for discriminant narrowing.
- **Adapter result** — `AdapterAPIResult<T>` is a discriminated union of `Success<T> | Failure` and is the return shape of every adapter method. `Success<T>`, `Failure`, and `FailureCode` are all exported. `Failure` carries an optional `code: FailureCode` for machine-readable failure classification (e.g. `NOT_FOUND` vs `CONNECTION`); consumers should fall back to `UNKNOWN` when `code` is absent.
- **Failure codes** — `FailureCode` is `(typeof FAILURE_CODES)[keyof typeof FAILURE_CODES]`, enumerating `NOT_IMPLEMENTED`, `NOT_FOUND`, `CONFLICT`, `CONFIGURATION`, `CONNECTION`, `PERMISSION`, `RATE_LIMIT`, `UPSTREAM`, `INVALID_INPUT`, and `UNKNOWN`. Adapter implementations should pick the most specific code that applies and reference it via `FAILURE_CODES.*`.
- **Common adapter** — `CommonRuntimeAdapter` declares `apiVersion: "1"` and `checkConnection(): Promise<AdapterAPIResult<null>>` and is extended by `RuntimeDatabaseAdapter` and `RuntimeStorageAdapter`. `apiVersion` is a string literal so a future v2 can be brandable and survives JSON round-trips.
- **Database Adapter** — `RuntimeDatabaseAdapter` extends `CommonRuntimeAdapter` and defines `id` (template literal `${Lowercase<string>}-database-adapter`), `upsertContentMetadata(placeholderId, path, payload)`, and `listContentMetadataByPath(path)`. `upsertContentMetadata` takes a discriminated union payload (`{ type: photo|video, assetKey }` or `{ type: text, text }`) in a single call signature — no overloads. `listContentMetadataByPath` returns `AdapterAPIResult<RaurusMetadata[]>`.
- **Storage Adapter** — `RuntimeStorageAdapter` extends `CommonRuntimeAdapter` and exposes a two-method menu, both optional: `createPresignedUploadUrl(assetKey, expiresIn?)` (returns `{ url: string; headers?: Headers }`) and `deleteAsset(assetKey)`. Each method returns `AdapterAPIResult<...>`.
- **Base configs** — `RuntimeDatabaseAdapterBaseConfig` and `RuntimeStorageAdapterBaseConfig` are empty interfaces that adapter implementations extend to define their own config options.
- **Factory types** — `RuntimeDatabaseAdapterFactory` and `RuntimeStorageAdapterFactory` are generic over `Config` (preserving concrete adapter configuration types through composition). They return the corresponding adapter interface directly — no phantom brand.
- **Adapter id helpers** — `RaurusDatabaseAdapterId` and `RaurusStorageAdapterId` are named template literal types used on each adapter interface's `id` field (e.g. `RuntimeDatabaseAdapter.id: RaurusDatabaseAdapterId`). They are `export`ed so consumers can reference them without re-declaring the pattern.

## Package Standards

- Keep all domain types in `@raurus/core` — implementations belong in separate packages
- Prefix adapter contracts and factories with `Runtime` (e.g. `RuntimeDatabaseAdapter`, `RuntimeStorageAdapterFactory`)
- Use interfaces for adapter contracts, types for factory functions and discriminated unions
- Provide empty base config interfaces that adapter packages extend
- Place new shared domain models (and their literal-union companions) in `src/types.ts` and re-export them through `src/index.ts`
- Place `as const` constant objects (like `FAILURE_CODES`, `METADATA_TYPES`) in `src/constants.ts` and re-export through `src/index.ts` alongside types
- Suffix the `RaurusMetadata` literal-type aliases with `Type` (e.g. `PhotoMetadataType`) — they describe the value of the `type` discriminant, not a record
- `tsconfig.json` for this package does not include the `DOM` lib; keep it that way
- The `oxlint-disable typescript/unified-signatures` directive at the top of `types.ts` is historical — keep it to preserve the linter exception in case the file later needs overloaded signatures
- Every adapter implementation must set `apiVersion: "1"` and may set `code: FailureCode` on `Failure` results to participate in the server's HTTP status mapping

## Testing

- This package is type-only, so tests are type assertions using Vitest's `expectTypeOf` — colocate them as `*.test.ts` next to the source they cover
- Mirror the structure of the public surface: domain types, discriminated unions, result helpers, each adapter contract, and the factory generics
- When adding a new public type, add a focused `it(...)` block in `src/types.test.ts` that pins its shape, narrowing, and (where relevant) callable signature
- Use module-scope helper factories (e.g. `makeMetadataAdapter`, `makeStorageAdapter`) inside type tests rather than re-declaring fake adapters per case
- Avoid naming `describe(...)` blocks after imported symbols — the `vitest/prefer-describe-function-title` rule flags matches against imported names
- `FailureCode`, `apiVersion`, `AdapterAPIResult`, the database adapter contract (`upsertContentMetadata`, `listContentMetadataByPath`), the storage adapter contract (`createPresignedUploadUrl`, `deleteAsset`, both optional), and the adapter template literal `id` types are all pinned in `src/types.test.ts`; keep the assertions in sync when changing the public surface

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (uses tsdown with exports mode)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- This package is currently type-only — all runtime logic lives in other packages
- The current public surface is a root entry point that re-exports `src/types.ts` and `src/constants.ts`
- When adding a new adapter concept, follow the existing factory pattern: `BaseConfig` interface → `Adapter` interface (extending `CommonRuntimeAdapter`) → `Factory` type
- When adding a new metadata variant to `RaurusMetadata`, add a new `*MetadataType` alias, extend `RaurusMetadataType`, extend the `RaurusMetadata` union, add a `METADATA_TYPES.*` entry in `constants.ts`, and add a new variant to the `upsertContentMetadata` payload discriminated union on `RuntimeDatabaseAdapter`
- When adding a new `FailureCode` value, add a `FAILURE_CODES.*` entry in `constants.ts` and document the HTTP status mapping guidance for `@raurus/server`'s `failureCodeToStatus` helper
