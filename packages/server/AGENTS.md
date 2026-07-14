# Package Agent Guide

## Package Context

This package is `@raurus/server`, a contract-first HTTP server built on Elysia. It provides a composable Elysia application with routes for metadata and asset management. It uses `@raurus/logger` for structured logging and never calls `configure()` itself — that is the responsibility of the consuming application.

## Architecture

```
src/
├── index.ts             # Public barrel — exports raurus and CreateRuntimeOptions from src/runtime/
├── core/
│   ├── index.ts              # Barrel: re-exports types + constants
│   ├── constants.ts          # FAILURE_CODES, METADATA_TYPES (as const objects)
│   ├── types.ts              # Domain types, adapter contracts, factories
│   └── types.test.ts         # Vitest type-level tests
├── adapters/
│   ├── database-libsql.ts    # libsql-based database adapter
│   ├── storage-s3mini.ts     # S3-compatible storage adapter backed by s3mini
│   └── index.ts              # Barrel: re-exports all adapters
└── runtime/
    ├── index.ts          # Named export: raurus (alias for createRuntime) + CreateRuntimeOptions
    ├── models.ts         # Elysia TypeSystem schemas (t.Object, t.String, etc.) + failureCodeToStatus mapper
    ├── routes.ts         # Route plugin — composable Elysia instance taking adapter options
    ├── runtime.ts        # createRuntime() — composes routes, returns { fetch }
    └── utils.ts          # Logger factory (getLogger("server"))

tsdown.config.ts          # Build config — entry: ["src/index.ts", "src/core/index.ts", "src/runtime/index.ts", "src/adapters/*/{index.ts,*/index.ts}"]
```

## Key Concepts

- **Single public export** — `raurus()` from `@raurus/server` is the only entry point. It creates a fetch-compatible runtime from adapter options. `CreateRuntimeOptions` is also exported as a type for consumers.
- **CreateRuntimeOptions** — `baseUrl: string | URL` (required), `databaseAdapter?: RuntimeDatabaseAdapter`, `storageAdapter?: RuntimeStorageAdapter`, `debug?: boolean` (default `false`). Field names use `databaseAdapter`/`storageAdapter`.
- **Route composition** — `routes.ts` takes `RouteOptions` with `databaseAdapter` and `storageAdapter` adapter objects. Routes use Elysia `.decorate()` to make adapters available to handlers as `db` and `storage`. Individual methods that may not exist on the adapter (e.g. `createPresignedUploadUrl`, `deleteAsset`) are guarded with a direct truthiness check in the handler, returning `501` when absent.
- **Logging** — Use `getLogger("server")` from `@raurus/logger` for runtime, route, and adapter logs. The server package only obtains loggers; the consuming app is responsible for calling `configure()` from `@logtape/logtape` once at startup.
- **Fetch-compatible** — `createRuntime()` returns `{ fetch }`, compatible with Bun, Cloudflare Workers, and other WinterCG runtimes.
- **Metadata upsert route** — `PUT /placeholders/:placeholder_id/pathnames/:pathname` accepts a discriminated body (`{ type: "photo"|"video", asset_key }` or `{ type: "text", text }`) and delegates to `db.upsertContentMetadata()`.
- **Presigned upload URL route** — `GET /assets/presigned-upload-url?asset_key=...` delegates to `storage.createPresignedUploadUrl()`. Returns `501` if the storage adapter doesn't implement it.
- **Delete asset route** — `DELETE /asset/:asset_key` delegates to `storage.deleteAsset()`. Returns `501` if the adapter doesn't implement it, and `404` when the adapter returns `NOT_FOUND`.
- **Failure code → HTTP status** — `models.ts` exports `failureCodeToStatus` that maps a `@raurus/core` `FailureCode` to an HTTP status (`NOT_FOUND` → 404, `CONFLICT` → 409, `RATE_LIMIT` → 429, `INVALID_INPUT` → 400, `PERMISSION` → 401, `NOT_IMPLEMENTED` → 501, `UPSTREAM` → 502, `CONNECTION` → 503, `CONFIGURATION` → 500, `UNKNOWN` → 500, anything else → 500). Routes use this to translate adapter `Failure` results into consistent HTTP responses without parsing `error.message`.
- **OpenAPI detail metadata** — Each route inlines `detail: { summary, description, tags }` on the Elysia handler options. Tags use the `Operations` and `Metadata` groups. When adding a new route, always include a `detail` block.

## Package Standards

- Keep runtime logic under `src/runtime/` — `src/index.ts` is a thin barrel that re-exports `raurus` and `CreateRuntimeOptions` from `./runtime`
- Define schemas in `models.ts` using `t.Object()` / `t.String()` etc. from Elysia's TypeSystem
- Routes import schemas via `import * as m from "./models"` and reference them as `m.SchemaName` — do not switch to named imports without a reason
- Pass adapter dependencies to `routes()` via `RouteOptions` and expose them to handlers via `.decorate("db", ...)` / `.decorate("storage", ...)`
- Export the runtime factory as `raurus` from `src/runtime/index.ts`
- Use `@raurus/logger` for all logs; create module-level `const log = getLogger("server")` loggers and do not call `configure()` inside this package
- When a route's underlying adapter call returns `Failure`, log the `error.message` and respond with `set.status = m.failureCodeToStatus(result.code)` and a `{ message: "Error", error: "<safe summary>" }` body
- When a storage method is not implemented on the adapter (e.g. no `createPresignedUploadUrl`), check `if (!storage.<methodName>)` and return `status(501, { message: "Error", error: "Storage adapter does not support <methodName>" })` — never return `400` for a missing method
- URL path parameters use `snake_case` naming (e.g. `:placeholder_id`, `:asset_key`), not `camelCase` — Elysia maps path params to handler `params` using the literal name from the path
- Each route inlines a `detail: { summary, description, tags }` block on the Elysia handler options for documentation generation

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes
- Build with `bun run build` (tsdown with ESM output)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- Build uses tsdown with entries `src/index.ts`, `src/core/index.ts`, `src/runtime/index.ts`, and `src/adapters/*/{index.ts,*/index.ts}` — category barrel exports and individual adapters are auto-picked up
- Adapters live as flat files under `src/adapters/` (e.g. `database-libsql.ts`, `storage-s3mini.ts`) and are barrel-exported from `src/adapters/index.ts`
- Adapters extend the base config interfaces from `@raurus/server/core` (`RuntimeDatabaseAdapterBaseConfig`, `RuntimeStorageAdapterBaseConfig`) and use factory types for type safety
- Database adapters — currently only `libsql`. The `CreateRuntimeOptions` field is named `databaseAdapter`.
- Storage adapters — currently only `s3mini`. The `CreateRuntimeOptions` field is named `storageAdapter`.
- All adapters must implement `checkConnection()` from `CommonRuntimeAdapter` (returns `AdapterAPIResult<null>` — i.e. `{ ok: true, data: null }` on success or `{ ok: false, error: Error, code?: FailureCode }` on failure) and must declare `apiVersion: "1"`
- `RuntimeDatabaseAdapter` exposes `upsertContentMetadata` and `listContentMetadataByPath` — both required. `upsertContentMetadata` takes a discriminated payload union (`{ type: photo|video, assetKey }` or `{ type: text, text }`).
- `RuntimeStorageAdapter` exposes a two-method menu (`createPresignedUploadUrl`, `deleteAsset`) — both optional, guarded at the route level with `501 Not Implemented` when absent
- `createRuntime()` is the runtime factory function defined in `runtime.ts`; it is re-exported as `raurus` from `runtime/index.ts`
- `utils.ts` exports a module-level `log` logger instance and re-exports `initializeLogger` from `@raurus/logger`
