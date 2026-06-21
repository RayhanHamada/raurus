# Package Agent Guide

## Package Context

This package is `@raurus/server`, a contract-first, OpenAPI-driven HTTP server built on Elysia with `@elysia/openapi`. It provides a fetch-compatible router, a runtime-generated OpenAPI 3.1 document, and a built-in Scalar API reference. It uses `@raurus/logger` for structured logging and never calls `configure()` itself — that is the responsibility of the consuming application.

## Architecture

```
src/
├── index.ts             # Public barrel — exports raurus and CreateRuntimeOptions from src/runtime/
├── adapters/
│   ├── auth/
│   │   ├── index.ts              # Barrel: re-exports all auth adapters
│   │   └── simple-password/
│   │       └── index.ts          # In-memory password-based auth adapter
│   ├── metadata/
│   │   ├── index.ts              # Barrel: re-exports all metadata adapters
│   │   ├── memory/
│   │   │   └── index.ts          # In-memory metadata adapter (dev/testing reference)
│   │   └── libsql/
│   │       └── index.ts          # libsql-based metadata storage adapter
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
- **Route options** — `routes.ts` takes `RouteOptions` with optional `metadata`, `storage`, and `auth` adapter objects. All three are optional on `CreateRuntimeOptions`; individual routes guard with the `checkMetadata` / `checkStorage` / `checkAuth` Elysia macros and return appropriate errors when the relevant adapter is missing (`501` for missing metadata/storage adapter, `401` for missing/invalid auth).
- **Logging** — Use `getPackageLogger("server")` from `@raurus/logger` for runtime, route, and adapter logs. The server package only obtains loggers; the consuming app is responsible for calling `configure()` from `@logtape/logtape` once at startup.
- **Health check route** — `GET /` returns `{ status: "OK", message: "RAURUS_ENDPOINT" }` and is documented under the `Operations` OpenAPI tag. Use it for monitoring and liveness probes.
- **Inline OpenAPI** — The `@elysia/openapi` plugin is configured inline in `utils.ts` with OpenAPI servers derived from parsing `baseUrl` (a required `string | URL`). When the pathname is `/`, the API prefix defaults to `_raurus`. The `openapi` option on `CreateRuntimeOptions` (defaults to `true`) toggles the plugin on/off.
- **Schema modules** — `models.ts` exports plain Elysia TypeSystem schemas plus a `failureCodeToStatus(code?: FailureCode): number` helper. Routes import the whole module as `import * as m from "./models"` and reference members as `m.SchemaName` etc. — keep the namespace import convention when adding routes.
- **Fetch-compatible** — `createRuntime()` returns `{ fetch }`, compatible with Bun, Cloudflare Workers, and other WinterCG runtimes.
- **Auth routes** — `POST /auth/login` (public) authenticates via the auth adapter and returns a session token. `GET /auth/verify` (auth-guarded) validates the current token. The `checkAuth` macro reads the `Authorization: Bearer <token>` header and calls `auth.validateToken()` before granting access.
- **Metadata routes** — `GET /metadata` (auth-guarded) lists metadata by optional `?placeholderIds=a,b,c` query. `GET /metadata/:placeholderId` (auth-guarded) returns a single record or 404. `PUT /metadata/:placeholderId` (auth-guarded + checkMetadata) upserts content with a discriminated body (`{ type: "photo"|"video", assetKey }` or `{ type: "text", text }`).
- **Asset content route** — `GET /asset-content/:assetKey` is public (no auth) and calls `storage.getAssetContent()` to stream the raw file with the correct content-type header. If the storage adapter does not implement `getAssetContent`, returns `501`.
- **Upload asset route** — `POST /upload-asset` is now auth-guarded and processes the file. It reads the first file from the multipart body, generates a unique `assetKey` (UUID + original extension), calls `storage.uploadAsset()`, and returns the `assetKey`. Returns `501` if `uploadAsset` is not implemented on the adapter.
- **Storage menu routes** — `GET /presigned-url`, `GET /presigned-download-url`, `POST /upload-asset`, and `DELETE /asset/:assetKey` are all auth-guarded (`checkAuth: true`). Each guards the corresponding optional method on the storage adapter. When a method is absent, returns `501 Not Implemented`.
- **Failure code → HTTP status** — `models.ts` exports `failureCodeToStatus` that maps a `@raurus/core` `FailureCode` to an HTTP status (`NOT_FOUND` → 404, `CONFLICT` → 409, `RATE_LIMIT` → 429, `INVALID_INPUT` → 400, `PERMISSION` → 401, `NOT_IMPLEMENTED` → 501, anything else → 500). Routes use this to translate adapter `Failure` results into consistent HTTP responses without parsing `error.message`.

## Package Standards

- Keep runtime logic under `src/runtime/` — `src/index.ts` is a thin barrel that re-exports `raurus` and `CreateRuntimeOptions` from `./runtime`
- Define schemas in `models.ts` using `t.Object()` / `t.String()` etc. from Elysia's TypeSystem
- Routes import schemas via `import * as m from "./models"` and reference them as `m.SchemaName` — do not switch to named imports without a reason
- Pass adapter dependencies to `routes()` via `RouteOptions`, not through Elysia state — `metadata`, `storage`, and `auth` are all optional; routes guard missing adapters with the `checkMetadata` / `checkStorage` / `checkAuth` macros
- Inline OpenAPI metadata (title, version, servers) in `utils.ts` — no separate config module
- Export the runtime factory as `raurus` from `src/runtime/index.ts`
- Use `@raurus/logger` for all logs; create module-level `const log = getPackageLogger("server")` loggers and do not call `configure()` inside this package
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
- Category barrels (`src/adapters/auth/index.ts`, `src/adapters/metadata/index.ts`, `src/adapters/storage/index.ts`) re-export all adapters in that category — consumers can import individual adapters or the category barrel
- Adapters extend the base config interfaces from `@raurus/core` (`RuntimeMetadataAdapterBaseConfig`, `RuntimeStorageAdapterBaseConfig`, `RuntimeAuthAdapterBaseConfig`) and use factory types for type safety
- Metadata adapters (`memory`, `libsql`) are under `src/adapters/metadata/` — imported via `@raurus/server/adapters/metadata` (barrel) or `@raurus/server/adapters/metadata/memory` / `@raurus/server/adapters/metadata/libsql` (individual)
- Storage adapters (`memory`, `local`, `s3mini`) are under `src/adapters/storage/` — imported via `@raurus/server/adapters/storage` (barrel) or `@raurus/server/adapters/storage/memory` / `@raurus/server/adapters/storage/local` / `@raurus/server/adapters/storage/s3mini` (individual)
- Auth adapters are under `src/adapters/auth/` — imported via `@raurus/server/adapters/auth` (barrel) or `@raurus/server/adapters/auth/simple-password` (individual)
- All adapters must implement `checkConnection()` from `CommonRuntimeAdapter` (returns `AdapterMethodResult<null>` — i.e. `{ ok: true, data: null }` on success or `{ ok: false, error: Error, code?: FailureCode }` on failure) and must declare `apiVersion: "1"`
- `RuntimeMetadataAdapter.bulkGetMetadataByPlaceholderIds` is **required**; example and reference adapters must implement it
- `RuntimeStorageAdapter` exposes a five-method menu (`uploadAsset`, `createPresignedUploadUrl`, `createPresignedDownloadUrl`, `deleteAsset`, `getAssetContent`) — all optional, but the route layer treats a missing method as `501 Not Implemented` rather than `400`
- `RuntimeAuthAdapter` exposes `authenticate(password)` and `validateToken(token)`. The `checkAuth` macro reads the `Authorization` header and calls `validateToken`; routes that need auth set `checkAuth: true` in their config.
- The `GET /asset-content/:assetKey` route is intentionally public (no `checkAuth`) so media assets can render for all visitors without authentication
- `RaurusAsset` from `@raurus/core` is `ArrayBuffer` only; the `POST /upload-asset` route reads the file body via `.arrayBuffer()`, generates a UUID-based asset key, calls `storage.uploadAsset()`, and returns `{ assetKey }`
- The `s3mini` storage adapter implements the full menu: `createPresignedUploadUrl` and `createPresignedDownloadUrl` use `client.getPresignedUrl("PUT"|"GET", key, expiresIn)`, and `deleteAsset` uses `client.deleteObject(key)` (returning `code: "NOT_FOUND"` when s3mini reports the object was not removed)
