# Package Agent Guide

## Package Context

`@raurus/contract` defines the shared oRPC procedure contracts and Valibot schemas for the Raurus API. Every procedure input and output shape is specified here, and both `@raurus/server` (implementation) and `@raurus/client` (consumption) depend on this package.

This file extends the root [AGENTS.md](../AGENTS.md).

## Architecture

```
src/
├── index.ts          # Public barrel — re-exports contracts, schemas, constants, and the Contracts type
├── contract.ts       # oRPC contract definitions (baseOc + 4 procedures) and Valibot schemas
└── constants.ts      # FAILURE_CODES, METADATA_TYPES, RESPONSE_MESSAGES (as const objects)
```

## Key Concepts

- **`baseOc`** — The base oRPC contract builder with shared error types: `NOT_IMPLEMENTED` (with `{ name: string }` data) and `CONFLICT` (with `{ name: string, detail?: string }` data).
- **`contracts`** — A const object containing four procedure contracts:
    - `upsertMetadata` — Upsert placeholder metadata (discriminated `text | link | photo` body).
    - `getPresignedUploadUrl` — Generate a presigned upload URL for an asset key.
    - `deleteAsset` — Delete an asset by key (declares its own `NOT_FOUND` error).
    - `listMetadataByPathname` — List all placeholder metadata for a given page pathname.
- **`metadataBodySchema`** — A Valibot discriminated union (`variant("type", [...])`) with three variants: `photo` (`{ type, assetKey }`), `text` (`{ type, text }`), and `link` (`{ type, text, link }`).
- **`FAILURE_CODES`**, **`METADATA_TYPES`**, **`RESPONSE_MESSAGES`** — Const objects shared between server and client for type-safe error handling and metadata type discrimination.
- **`assetKeySchema`** — A regex-validated string preventing empty keys, leading slashes, and double slashes in asset key paths.

## Package Standards

- All procedure contracts export both their type (`Contracts`) and runtime value (`contracts`) — the server `implement()`s the runtime value while the client imports the type
- Do not define business logic here — this package is purely schemas and contract shapes
- Keep schemas synced with the runtime models in `@raurus/server` — when adding a new metadata variant, update both the discriminated union here and the database adapter's payload type
- Re-export everything through `src/index.ts` so consumers have a single import path

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes
- This package has no `build` or `test` scripts — only `typecheck` (`tsc --noEmit`)
- Run `bun run typecheck` at the root to verify this package alongside all others

## Package Notes

- This package has no build step or tsdown config — it exports raw TypeScript via the `"exports"` field in `package.json`
- `valibot` is a direct dependency for schema definitions; `@orpc/contract` provides the `oc` contract builder
- The `baseOc` contract's `NOT_IMPLEMENTED` error is reused by `getPresignedUploadUrl`, while `deleteAsset` adds its own `NOT_FOUND` error on top of the base errors
- When adding a new procedure, also update the `RaurusClient` interface in `@raurus/client` and the procedure implementations in `@raurus/server/runtime/routes.ts`
