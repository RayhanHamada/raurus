# Plan: Sync AGENTS.md after runtime + adapter restructure

## Scope

Recent commits (HEAD~10..HEAD) restructured the `@raurus/server` runtime, removed the standalone `@raurus/adapter-memory` package, removed the Cloudflare D1/R2 adapter subdirectories, and added the `CommonRuntimeAdapter.checkConnection()` contract to `@raurus/core`. The AGENTS files have drifted from the current code.

Affected areas:
- `packages/server/AGENTS.md` — documents removed `cloudflare-d1`/`cloudflare-r2` adapter dirs and missing `checkConnection` guidance
- `examples/example-server/AGENTS.md` — already aligned with the current state (imports come from `@raurus/server/adapters/*`, `raurus()` factory). No update needed
- `packages/core/AGENTS.md` — already mentions `RuntimeMetadataAdapter`/`RuntimeStorageAdapter`. Needs a small note that adapters must implement `checkConnection()` via `CommonRuntimeAdapter`
- Root `AGENTS.md` — workspace diagram still matches the current tree (`core`, `server`, `tsconfig` packages, `example-server`). No update needed

## Changes to apply

### 1. `packages/server/AGENTS.md`

**Replace the Architecture tree** to drop the removed adapter directories and add `CreateRuntimeOptions` to the description of `utils.ts`:

```diff
 src/
 ├── index.ts             # Public barrel — re-exports from src/runtime/
 ├── adapters/
-│   ├── cloudflare-d1/
-│   │   └── index.ts       # D1 metadata adapter
-│   ├── cloudflare-r2/
-│   │   └── index.ts       # R2 storage adapter
 │   ├── example-metadata-adapter/
 │   │   └── index.ts       # In-memory metadata adapter (dev/testing reference)
 │   └── example-storage-adapter/
 │       └── index.ts       # In-memory storage adapter (dev/testing reference)
 └── runtime/
     ├── index.ts          # Named export: raurus (alias for createRuntime)
     ├── models.ts         # Elysia TypeSystem schemas (t.Object, t.String, etc.)
     ├── routes.ts         # Route plugin — composable Elysia instance taking adapter options
-    └── utils.ts          # createRuntime() — inline OpenAPI config, route composition, fetch handle
+    └── utils.ts          # createRuntime() + CreateRuntimeOptions — inline OpenAPI config, route composition, fetch handle
```

**Replace the Package Notes section** to remove the Cloudflare claims and add the `checkConnection` contract note:

```diff
 ## Package Notes

 - Build uses tsdown with entries `src/index.ts`, `src/runtime/index.ts`, and `src/adapters/*/index.ts` — new adapter subdirectories are auto-picked up
 - Each adapter subdirectory under `src/adapters/` must have a corresponding `exports` entry in `package.json` (e.g. `"./adapters/example-metadata-adapter": "./dist/adapters/example-metadata-adapter/index.mjs"`)
 - Adapters extend the base config interfaces from `@raurus/core` (`RuntimeMetadataAdapterBaseConfig`, `RuntimeStorageAdapterBaseConfig`) and use factory types for type safety
 - Example adapters (`example-metadata-adapter`, `example-storage-adapter`) provide in-memory Map-based implementations for development and testing — imported via `@raurus/server/adapters/example-metadata-adapter` and `@raurus/server/adapters/example-storage-adapter`
-- Cloudflare adapters (`cloudflare-d1`, `cloudflare-r2`) depend on `@cloudflare/workers-types` and `s3mini` respectively — currently stubbed with descriptive errors
+- The previous Cloudflare D1/R2 adapter subdirectories (`src/adapters/cloudflare-d1`, `src/adapters/cloudflare-r2`) have been removed from this package; the `s3mini` and `@cloudflare/workers-types` entries still listed in `package.json` are stale dependencies left over from that work and will be cleaned up in a follow-up
+- Adapters must implement `CommonRuntimeAdapter.checkConnection()` (returning `{ ok, message? }`) per the contract in `@raurus/core`
 - Routes guard optional adapter methods (e.g. `createPresignedUploadUrl`) before calling them
 - Handlers are still stubbed in their responses — wire to full adapter logic when ready
```

### 2. `packages/core/AGENTS.md`

Add one bullet under **Key Concepts** documenting `CommonRuntimeAdapter` and `checkConnection`:

```diff
+- **Common runtime adapter** — `CommonRuntimeAdapter` defines the `checkConnection(): Promise<{ ok: boolean; message?: string }>` contract that every metadata and storage adapter must implement; `RuntimeMetadataAdapter` and `RuntimeStorageAdapter` both extend it
```

## Files reviewed but unchanged

- `AGENTS.md` (root) — workspace tree and standards still match the current monorepo layout
- `examples/example-server/AGENTS.md` — imports and `raurus()` factory references already match `examples/example-server/src/index.ts`

## Verification

1. Re-read `packages/server/AGENTS.md` and `packages/core/AGENTS.md` after the edits and confirm there are no remaining references to `cloudflare-d1`, `cloudflare-r2`, the old `config.ts`/`types.ts`/`runtime.ts` files, or the removed `@raurus/adapter-memory` package
2. `git grep -nE 'cloudflare|adapter-memory' packages/server/AGENTS.md packages/core/AGENTS.md AGENTS.md` should return no matches inside guidance prose
3. The adapter subdirectories in the Architecture tree should match the actual `packages/server/src/adapters/` contents (`example-metadata-adapter`, `example-storage-adapter` only)
4. Optional follow-up (out of scope for this sync): drop the stale `s3mini` and `@cloudflare/workers-types` entries from `packages/server/package.json` and the `s3mini` lockfile entry
