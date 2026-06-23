# Package Agent Guide

## Package Context

This package is `@raurus/server`, a contract-first, OpenAPI-driven HTTP server built on Elysia with `@elysia/openapi`. It provides a fetch-compatible router, a runtime-generated OpenAPI 3.1 document, and a built-in Scalar API reference. It uses `@raurus/logger` for structured logging and never calls `configure()` itself — that is the responsibility of the consuming application.

## Architecture

```
src/
├── index.ts             # Public barrel — exports raurus and CreateRuntimeOptions from src/runtime/
├── adapters/
│   ├── database/
│   │   ├── index.ts              # Barrel: re-exports all database adapters
│   │   ├── memory/
│   │   │   └── index.ts          # In-memory database adapter (dev/testing reference)
│   │   └── libsql/
│   │       └── index.ts          # libsql-based database adapter
│   └── storage/
│       ├── index.ts              # Barrel: re-exports all storage adapters
│       ├── memory/
│       │   └── index.ts          # In-memory storage adapter (dev/testing reference)
│       ├── local/
│       │   └── index.ts          # Node.js filesystem storage adapter
│       └── s3mini/
│           └── index.ts          # S3-compatible storage adapter backed by s3mini
└── runtime/
    ├── index.ts          # Named export: raurus (alias for createRuntime) + CreateRuntimeOptions
    ├── models.ts         # Elysia TypeSystem schemas (t.Object, t.String, etc.) + failureCodeToStatus mapper
    ├── routes.ts         # Route plugin — composable Elysia instance taking adapter options
    └── utils.ts          # createRuntime() — inline OpenAPI config, route composition, fetch handle

tsdown.config.ts          # Build config — entry: ["src/index.ts", "src/runtime/index.ts", "src/adapters/*/{index.ts,*/index.ts}"]
```

## Key Concepts

- **Single public export** — `raurus()` from `@raurus/server` is the only entry point. It creates a fetch-compatible runtime from adapter options. `CreateRuntimeOptions` is also exported as a type for consumers.
- **Route options** — `routes.ts` takes `RouteOptions` with optional `metadata` and `storage` adapter objects. Individual routes guard with the `checkMetadata` / `checkStorage` Elysia macros and return `501` when the relevant adapter is missing.
- **Logging** — Use `getLogger("server")` from `@raurus/logger` for runtime, route, and adapter logs. The server package only obtains loggers; the consuming app is responsible for calling `configure()` from `@logtape/logtape` once at startup.
- **Health check route** — `GET /` returns `{ status: "OK", message: "RAURUS_ENDPOINT" }` and is documented under the `Operations` OpenAPI tag. Use it for monitoring and liveness probes.
- **Inline OpenAPI** — The `@elysia/openapi` plugin is configured inline in `utils.ts` with OpenAPI servers derived from parsing `baseUrl` (a required `string | URL`). When the pathname is `/`, the API prefix defaults to `_raurus`. The `openapi` option on `CreateRuntimeOptions` (defaults to `true`) toggles the plugin on/off.
- **Schema modules** — `models.ts` exports plain Elysia TypeSystem schemas plus a `failureCodeToStatus(code?: FailureCode): number` helper. Routes import the whole module as `import * as m from "./models"` and reference members as `m.SchemaName` etc. — keep the namespace import convention when adding routes.
- **Fetch-compatible** — `createRuntime()` returns `{ fetch }`, compatible with Bun, Cloudflare Workers, and other WinterCG runtimes.
- **Metadata routes** — `GET /metadata` lists metadata by optional `?placeholderIds=a,b,c` query. `GET /metadata/:placeholderId` returns a single record or 404. `PUT /metadata/:placeholderId` upserts content with a discriminated body (`{ type: "photo"|"video", assetKey }` or `{ type: "text", text }`).
- **Asset content route** — `GET /asset-content/:assetKey` is public and calls `storage.getAssetContent()` to stream the raw file with the correct content-type header. If the storage adapter does not implement `getAssetContent`, returns `501`.
- **Upload asset route** — `POST /upload-asset` processes the file. It reads the first file from the multipart body, generates a unique `assetKey` (UUID + original extension), calls `storage.uploadAsset()`, and returns the `assetKey`. Returns `501` if `uploadAsset` is not implemented on the adapter.
- **Storage menu routes** — `GET /presigned-url`, `GET /presigned-download-url`, `POST /upload-asset`, and `DELETE /asset/:assetKey`. Each guards the corresponding optional method on the storage adapter. When a method is absent, returns `501 Not Implemented`.
- **Failure code → HTTP status** — `models.ts` exports `failureCodeToStatus` that maps a `@raurus/core` `FailureCode` to an HTTP status (`NOT_FOUND` → 404, `CONFLICT` → 409, `RATE_LIMIT` → 429, `INVALID_INPUT` → 400, `PERMISSION` → 401, `NOT_IMPLEMENTED` → 501, anything else → 500). Routes use this to translate adapter `Failure` results into consistent HTTP responses without parsing `error.message`.

## Package Standards

- Keep runtime logic under `src/runtime/` — `src/index.ts` is a thin barrel that re-exports `raurus` and `CreateRuntimeOptions` from `./runtime`
- Define schemas in `models.ts` using `t.Object()` / `t.String()` etc. from Elysia's TypeSystem
- Routes import schemas via `import * as m from "./models"` and reference them as `m.SchemaName` — do not switch to named imports without a reason
- Pass adapter dependencies to `routes()` via `RouteOptions`, not through Elysia state — `metadata` (typed as `RuntimeDatabaseAdapter`) and `storage` are both optional; routes guard missing adapters with the `checkMetadata` / `checkStorage` macros
- Inline OpenAPI metadata (title, version, servers) in `utils.ts` — no separate config module
- Export the runtime factory as `raurus` from `src/runtime/index.ts`
- Use `@raurus/logger` for all logs; create module-level `const log = getLogger("server")` loggers and do not call `configure()` inside this package
- When a route hits a storage adapter method that the adapter does not implement, return `status(501, { message: "Error", error: "Storage adapter does not support <methodName>" })` — never return `400` for a missing method
- When a route's underlying adapter call returns `Failure`, log the `error.message` and respond with `status(failureCodeToStatus(result.code), { message: "Error", error: <safe summary> })`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes
- Build with `bun run build` (tsdown with ESM output)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- Build uses tsdown with entries `src/index.ts`, `src/runtime/index.ts`, and `src/adapters/*/{index.ts,*/index.ts}` — category barrel exports and individual adapters are auto-picked up
- Each adapter subdirectory under `src/adapters/<category>/` must have a corresponding `exports` entry in `package.json` (e.g. `"./adapters/storage/local": "./dist/adapters/storage/local/index.mjs"`)
- Category barrels (`src/adapters/database/index.ts`, `src/adapters/storage/index.ts`) re-export all adapters in that category — consumers can import individual adapters or the category barrel
- Adapters extend the base config interfaces from `@raurus/core` (`RuntimeDatabaseAdapterBaseConfig`, `RuntimeStorageAdapterBaseConfig`) and use factory types for type safety
- Database adapters (`memory`, `libsql`) are under `src/adapters/database/` — imported via `@raurus/server/adapters/database` (barrel) or `@raurus/server/adapters/database/memory` / `@raurus/server/adapters/database/libsql` (individual). The `CreateRuntimeOptions` field is named `metadataAdapter` but accepts a `RuntimeDatabaseAdapter`.
- Storage adapters (`memory`, `local`, `s3mini`) are under `src/adapters/storage/` — imported via `@raurus/server/adapters/storage` (barrel) or `@raurus/server/adapters/storage/memory` / `@raurus/server/adapters/storage/local` / `@raurus/server/adapters/storage/s3mini` (individual)
- All adapters must implement `checkConnection()` from `CommonRuntimeAdapter` (returns `AdapterMethodResult<null>` — i.e. `{ ok: true, data: null }` on success or `{ ok: false, error: Error, code?: FailureCode }` on failure) and must declare `apiVersion: "1"`
- `RuntimeDatabaseAdapter.bulkGetMetadataByPlaceholderIds` is **required**; example and reference adapters must implement it
- `RuntimeStorageAdapter` exposes a five-method menu (`uploadAsset`, `createPresignedUploadUrl`, `createPresignedDownloadUrl`, `deleteAsset`, `getAssetContent`) — all optional, but the route layer treats a missing method as `501 Not Implemented` rather than `400`
- The `GET /asset-content/:assetKey` route is intentionally public so media assets can render for all visitors
- `RaurusAsset` from `@raurus/core` is `ArrayBuffer` only; the `POST /upload-asset` route reads the file body via `.arrayBuffer()`, generates a UUID-based asset key, calls `storage.uploadAsset()`, and returns `{ assetKey }`
- The `s3mini` storage adapter implements the full menu: `createPresignedUploadUrl` and `createPresignedDownloadUrl` use `client.getPresignedUrl("PUT"|"GET", key, expiresIn)`, and `deleteAsset` uses `client.deleteObject(key)` (returning `code: "NOT_FOUND"` when s3mini reports the object was not removed)
  Object(key)`(returning`code: "NOT_FOUND"` when s3mini reports the object was not removed)
