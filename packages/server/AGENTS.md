# Package Agent Guide

## Package Context

This package is `@raurus/server`, a contract-first, OpenAPI-driven HTTP server built on Elysia with `@elysia/openapi`. It provides a fetch-compatible router, a runtime-generated OpenAPI 3.1 document, and a built-in Scalar API reference. It uses `@raurus/logger` for structured logging and never calls `configure()` itself — that is the responsibility of the consuming application.

## Architecture

```
src/
├── index.ts             # Public barrel — exports raurus and CreateRuntimeOptions from src/runtime/
├── adapters/
│   ├── database/
│   │   ├── index.ts              # Barrel: re-exports libSqlDatabaseAdapter
│   │   └── libsql/
│   │       └── index.ts          # libsql-based database adapter
│   └── storage/
│       ├── index.ts              # Barrel: re-exports s3MiniStorageAdapter
│       └── s3mini/
│           └── index.ts          # S3-compatible storage adapter backed by s3mini
└── runtime/
    ├── index.ts          # Named export: raurus (alias for createRuntime) + CreateRuntimeOptions
    ├── models.ts         # Elysia TypeSystem schemas (t.Object, t.String, etc.) + failureCodeToStatus mapper
    ├── routes.ts         # Route plugin — composable Elysia instance taking adapter options
    └── runtime.ts        # createRuntime() — inline OpenAPI config, route composition, fetch handle

tsdown.config.ts          # Build config — entry: ["src/index.ts", "src/runtime/index.ts", "src/adapters/*/{index.ts,*/index.ts}"]
```

## Key Concepts

- **Single public export** — `raurus()` from `@raurus/server` is the only entry point. It creates a fetch-compatible runtime from adapter options. `CreateRuntimeOptions` is also exported as a type for consumers.
- **CreateRuntimeOptions** — `baseUrl: string | URL` (required), `databaseAdapter?: RuntimeDatabaseAdapter`, `storageAdapter?: RuntimeStorageAdapter`, `openapi?: boolean` (default `true`). Field names use `databaseAdapter`/`storageAdapter`, not `metadataAdapter`.
- **Route composition** — `routes.ts` takes `RouteOptions` with optional `database` and `storage` adapter objects. Routes use the `checkDatabase` and `checkStorage` Elysia macros to guard missing adapters and return `501` when the relevant adapter is not configured. The macros also resolve the adapter into `custom.database` / `custom.storage` so route handlers access them without optional chaining.
- **Logging** — Use `getLogger("server")` from `@raurus/logger` for runtime, route, and adapter logs. The server package only obtains loggers; the consuming app is responsible for calling `configure()` from `@logtape/logtape` once at startup.
- **Health check route** — `GET /` returns `{ status: "OK", message: "RAURUS_ENDPOINT" }` and is documented under the `Operations` OpenAPI tag. Use it for monitoring and liveness probes.
- **Inline OpenAPI** — The `@elysia/openapi` plugin is configured inline in `runtime.ts` with OpenAPI servers derived from parsing `baseUrl` (a required `string | URL`). When the pathname is `/`, the API prefix defaults to `_raurus`. The `openapi` option on `CreateRuntimeOptions` (defaults to `true`) toggles the plugin on/off.
- **Schema modules** — `models.ts` exports Elysia TypeSystem schemas plus a `failureCodeToStatus(code?: FailureCode): number` helper. Routes import the whole module as `import * as m from "./models"` and reference members as `m.SchemaName` etc. — keep the namespace import convention when adding routes.
- **Fetch-compatible** — `createRuntime()` returns `{ fetch }`, compatible with Bun, Cloudflare Workers, and other WinterCG runtimes.
- **Metadata upsert route** — `PUT /placeholders/:placeholderId/pathnames/:pathname` accepts a discriminated body (`{ type: "photo"|"video", assetKey }` or `{ type: "text", text }`) and delegates to `database.upsertContentMetadata()`. Requires the `checkDatabase` macro.
- **Presigned upload URL route** — `GET /assets/presigned-upload-url?assetKey=...&expiresIn=...` delegates to `storage.createPresignedUploadUrl()`. Returns `501` if the adapter doesn't implement it. Requires the `checkStorage` macro.
- **Delete asset route** — `DELETE /asset/:assetKey` delegates to `storage.deleteAsset()`. Returns `501` if the adapter doesn't implement it, and `404` when the adapter returns `NOT_FOUND`. Requires the `checkStorage` macro.
- **Failure code → HTTP status** — `models.ts` exports `failureCodeToStatus` that maps a `@raurus/core` `FailureCode` to an HTTP status (`NOT_FOUND` → 404, `CONFLICT` → 409, `RATE_LIMIT` → 429, `INVALID_INPUT` → 400, `PERMISSION` → 401, `NOT_IMPLEMENTED` → 501, `UPSTREAM` → 502, `CONNECTION` → 503, `CONFIGURATION` → 500, `UNKNOWN` → 500, anything else → 500). Routes use this to translate adapter `Failure` results into consistent HTTP responses without parsing `error.message`.
- **OpenAPI detail metadata** — Each route inlines `detail: { summary, description, tags }` on the Elysia handler options for `@elysia/openapi` documentation generation. Tags use the `Operations` and `Metadata` groups. When adding a new route, always include a `detail` block.

## Package Standards

- Keep runtime logic under `src/runtime/` — `src/index.ts` is a thin barrel that re-exports `raurus` and `CreateRuntimeOptions` from `./runtime`
- Define schemas in `models.ts` using `t.Object()` / `t.String()` etc. from Elysia's TypeSystem
- Routes import schemas via `import * as m from "./models"` and reference them as `m.SchemaName` — do not switch to named imports without a reason
- Pass adapter dependencies to `routes()` via `RouteOptions`, not through Elysia state — `database` and `storage` are both optional; routes guard missing adapters with the `checkDatabase` / `checkStorage` macros
- Inline OpenAPI metadata (title, version, servers) in `runtime.ts` — no separate config module
- Export the runtime factory as `raurus` from `src/runtime/index.ts`
- Use `@raurus/logger` for all logs; create module-level `const log = getLogger("server")` loggers and do not call `configure()` inside this package
- When a route's underlying adapter call returns `Failure`, log the `error.message` and respond with `status(failureCodeToStatus(result.code), { message: "Error", error: <safe summary> })`
- When a storage method is not implemented on the adapter (e.g. no `createPresignedUploadUrl` on the adapter), check `if (!custom.storage.<methodName>)` and return `status(501, { message: "Error", error: "Storage adapter does not support <methodName>" })` — never return `400` for a missing method
- Each route should inlines a `detail: { summary, description, tags }` block on the Elysia handler options for `@elysia/openapi` documentation generation

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes
- Build with `bun run build` (tsdown with ESM output)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- Build uses tsdown with entries `src/index.ts`, `src/runtime/index.ts`, and `src/adapters/*/{index.ts,*/index.ts}` — category barrel exports and individual adapters are auto-picked up
- Each adapter subdirectory under `src/adapters/<category>/` must have a corresponding `exports` entry in `package.json` (e.g. `"./adapters/storage/s3mini": "./dist/adapters/storage/s3mini/index.mjs"`)
- Category barrels (`src/adapters/database/index.ts`, `src/adapters/storage/index.ts`) re-export all adapters in that category — consumers can import individual adapters or the category barrel
- Adapters extend the base config interfaces from `@raurus/core` (`RuntimeDatabaseAdapterBaseConfig`, `RuntimeStorageAdapterBaseConfig`) and use factory types for type safety
- Database adapters are under `src/adapters/database/` — currently only `libsql`. Imported via `@raurus/server/adapters/database` (barrel) or `@raurus/server/adapters/database/libsql` (individual). The `CreateRuntimeOptions` field is named `databaseAdapter`.
- Storage adapters are under `src/adapters/storage/` — currently only `s3mini`. Imported via `@raurus/server/adapters/storage` (barrel) or `@raurus/server/adapters/storage/s3mini` (individual). The `CreateRuntimeOptions` field is named `storageAdapter`.
- All adapters must implement `checkConnection()` from `CommonRuntimeAdapter` (returns `AdapterAPIResult<null>` — i.e. `{ ok: true, data: null }` on success or `{ ok: false, error: Error, code?: FailureCode }` on failure) and must declare `apiVersion: "1"`
- `RuntimeDatabaseAdapter` exposes `upsertContentMetadata` and `listContentMetadataByPath` — both required. `upsertContentMetadata` takes a discriminated payload union (`{ type: photo|video, assetKey }` or `{ type: text, text }`).
- `RuntimeStorageAdapter` exposes a two-method menu (`createPresignedUploadUrl`, `deleteAsset`) — both optional, guarded at the route level with `501 Not Implemented` when absent
- Route macros (`checkDatabase`, `checkStorage`) are defined in `routes.ts` via Elysia's `.macro()` — they handle both the `beforeHandle` guard (returning `501` when the adapter is missing) and a `resolve` that narrows the adapter type so handlers access it without optional chaining
- `Runtime` (the file formerly named `utils.ts`) is now `runtime.ts` — it contains `createRuntime()` and `CreateRuntimeOptions`
