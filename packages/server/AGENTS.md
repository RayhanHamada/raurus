# Package Agent Guide

## Package Context

This package is `@raurus/server`, a contract-first HTTP server built on [oRPC](https://orpc.dev). It implements the shared contracts from `@raurus/contract` using `@orpc/server` and exposes an `RPCHandler`-backed fetch handler. It uses `@raurus/logger` for structured logging and never calls `configure()` itself — that is the responsibility of the consuming application.

## Architecture

```
src/
├── index.ts             # Public barrel — exports raurus and CreateRuntimeOptions from src/runtime/
├── core/
│   ├── index.ts              # Barrel: re-exports types from types.ts + constants from @raurus/contract
│   ├── types.ts              # Domain types, adapter contracts, factories
│   └── types.test.ts         # Vitest type-level tests
├── adapters/
│   ├── auto-init.ts          # withAutoInit() — lazy-init wrapper for all adapters
│   ├── database-libsql.ts    # libsql-based database adapter
│   ├── storage-s3mini.ts     # S3-compatible storage adapter backed by s3mini
│   └── index.ts              # Barrel: re-exports all adapters + withAutoInit
└── runtime/
    ├── index.ts          # Named export: raurus (alias for createRuntime) + CreateRuntimeOptions
    ├── models.ts         # failureCodeToStatus mapper (FailureCode → HTTP status)
    ├── routes.ts         # oRPC procedure implementations — wraps @raurus/contract contracts via implement()
    ├── runtime.ts        # createRuntime() — creates RPCHandler, returns { fetch, close }
    └── utils.ts          # Logger factory (getLogger("server"))

tsdown.config.ts          # Build config — entry: ["src/index.ts", "src/core/index.ts", "src/runtime/index.ts", "src/adapters/*/{index.ts,*/index.ts}"]
```

## Key Concepts

- **Single public export** — `raurus()` from `@raurus/server` is the only entry point. It creates a fetch-compatible runtime from adapter options. `CreateRuntimeOptions` is also exported as a type for consumers. `Router` (the oRPC router type derived from `typeof router`) is exported so that RPC clients (e.g., `RPCLink`) can consume the server's typed procedure signatures.
- **Contract-first** — Routes are defined in `@raurus/contract` (Valibot schemas + oRPC contracts). The server package implements them via `@orpc/server`'s `implement(contracts).$context<ServerContext>()`. Input validation is handled entirely by the contract layer.
- **CreateRuntimeOptions** — `baseUrl: string | URL` (required), `databaseAdapter: RuntimeDatabaseAdapter` (required), `storageAdapter: RuntimeStorageAdapter` (required), `debug?: boolean` (default `false`).
- **Context-based dependency injection** — `routes.ts` defines a `ServerContext` interface `{ db: RuntimeDatabaseAdapter; storage: RuntimeStorageAdapter }`. The `implement(contracts).$context<ServerContext>()` threads adapters to every handler via the oRPC context, replacing Elysia's `.decorate()` pattern.
- **Error handling** — Procedure handlers throw `ORPCError` with a typed error code (`NOT_IMPLEMENTED`, `NOT_FOUND`, `CONFLICT`) and an HTTP status derived from `failureCodeToStatus()`. The `NOT_IMPLEMENTED` error carries `{ name: string }` data as defined in the contract. The `NOT_FOUND` error is defined on the `deleteAsset` contract specifically. The `CONFLICT` error carries `{ name: string, detail?: string }` and is used when a placeholder type mismatch is detected.
- **Logging** — Use `getLogger("server")` from `@raurus/logger` for runtime, route, and adapter logs. The server package only obtains loggers; the consuming app is responsible for calling `configure()` from `@logtape/logtape` once at startup.
- **Fetch-compatible** — `createRuntime()` returns `{ fetch, close }`, backed by `RPCHandler` from `@orpc/server/fetch`, compatible with Bun, Cloudflare Workers, and other WinterCG runtimes. The `close()` method gracefully shuts down both adapters. In serverless environments like Cloudflare Workers, there is no automatic shutdown hook — `close()` must be called explicitly by the consumer (e.g., in a scheduled handler or via a custom lifecycle wrapper). `new URL()` is used for baseUrl parsing instead of `URL.parse()` for broad Workers compatibility date support.
- **Adapter lifecycle** — Every adapter implements `init()` and `close()` from `AdapterLifecycle` (inherited via `CommonRuntimeAdapter`). `init()` runs lazily on the first adapter method invocation via the `withAutoInit()` wrapper in `createRuntime()`. Adapter factories are synchronous and pure — they construct the adapter object but perform no side effects. All setup (connection opening, schema migrations, authentication) goes in `init()`. `close()` releases resources; after `close()`, all subsequent method calls throw.
- **`withAutoInit()`** — A generic wrapper in `src/adapters/auto-init.ts` that guarantees `init()` runs exactly once, concurrency-safe, with retry-on-failure and a 5-second cooldown. Also poisons the adapter after `close()`. The wrapper is transparent to consumers — routes see the same `RuntimeDatabaseAdapter` / `RuntimeStorageAdapter` interface.
- **Metadata upsert procedure** — `upsertMetadata` delegates directly to `db.upsertContentMetadata()`. Each `(placeholder_id, pathname)` pair is an independent row — the same `placeholder_id` may exist on different pages with different types. Throws `ORPCError("NOT_IMPLEMENTED", ...)` on adapter failure.
- **Placeholder storage** — A single `raurus_placeholders` table stores all placeholder data with composite primary key `(placeholder_id, pathname)`. There is no separate definitions table and no type-enforcement layer — the server simply upserts whatever the client sends.
- **Metadata read procedure** — `listMetadataByPathname` delegates to `db.listContentMetadataByPath()` and returns all placeholder metadata for a given pathname. Used by the frontend to hydrate placeholder values on page load.
- **Presigned upload URL procedure** — `getPresignedUploadUrl` delegates to `storage.createPresignedUploadUrl()`. Throws `ORPCError("NOT_IMPLEMENTED", { status: 501 })` if the storage adapter doesn't implement it.
- **Delete asset procedure** — `deleteAsset` delegates to `storage.deleteAsset()`. Throws `ORPCError("NOT_FOUND", { status: 404 })` when the adapter returns `NOT_FOUND`, and `ORPCError("NOT_IMPLEMENTED", { status: 501 })` when the adapter doesn't implement deletion.
- **Failure code → HTTP status** — `models.ts` exports `failureCodeToStatus` that maps a `FailureCode` to an HTTP status. Used by procedure handlers as the `status` parameter when throwing `ORPCError`.

## Package Standards

- Keep runtime logic under `src/runtime/` — `src/index.ts` is a thin barrel that re-exports `raurus` and `CreateRuntimeOptions` from `./runtime`
- `routes.ts` is the single file defining procedure implementations using `implement()` from `@orpc/server` and the contracts from `@raurus/contract`
- Export the runtime factory as `raurus` from `src/runtime/index.ts`
- Use `@raurus/logger` for all logs; create module-level `const log = getLogger("server")` loggers and do not call `configure()` inside this package
- When a procedure's underlying adapter call returns `Failure`, log the `error.message` and throw an `ORPCError` with the mapped status from `failureCodeToStatus(result.code)` and a descriptive `data.name`
- When a storage method is not implemented on the adapter, check `if (!storage.<methodName>)` and throw `ORPCError("NOT_IMPLEMENTED", { status: 501 })` — never use a 400 status for a missing method
- All validation is defined in `@raurus/contract` — do not duplicate schemas in the server package

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
- All adapters must implement `checkConnection()` from `CommonRuntimeAdapter` (returns `AdapterAPIResult<null>`) and must declare `apiVersion: "1"`
- `RuntimeDatabaseAdapter` exposes `upsertContentMetadata` and `listContentMetadataByPath` — both required. `upsertContentMetadata` takes a discriminated payload union (`{ type: photo, assetKey } | { type: text, text } | { type: link, text, link }`). Link payloads now carry both `text` (display/anchor text) and `link` (href URL).
- `listContentMetadataByPath` returns `AdapterAPIResult<RaurusMetadataWithPath[]>` — each item includes `placeholderId`, `pathname`, `type`, and type-specific fields (`text`, `link`, or `assetKey`).
- `RuntimeStorageAdapter` exposes a two-method menu (`createPresignedUploadUrl`, `deleteAsset`) — both optional, guarded at the procedure level with `NOT_IMPLEMENTED` ORPCError when absent
- `createRuntime()` is the runtime factory function defined in `runtime.ts`; it is re-exported as `raurus` from `runtime/index.ts`. The return type includes a `close()` method for graceful shutdown.
- Adapter factories are synchronous and pure — all setup side effects (connections, schema migrations, authentication) go in `init()`, which is called lazily by `withAutoInit()`. Config validation may still throw synchronously in the factory.
- `withAutoInit()` in `src/adapters/auto-init.ts` is the single source of truth for adapter lifecycle management. New adapters automatically get lazy init, concurrency safety, retry-on-failure, and close poisoning just by implementing `init()`/`close()`.
- `utils.ts` exports a module-level `log` logger instance and re-exports `initializeLogger` from `@raurus/logger`
- The `@raurus/contract` package is a `workspace:*` dependency; contracts are imported via `import { contracts, FAILURE_CODES } from "@raurus/contract"`. The `baseOc` contract defines three shared error types: `NOT_IMPLEMENTED`, `NOT_FOUND` (on `deleteAsset` only), and `CONFLICT`.
- The libsql database adapter creates a single `raurus_placeholders` table on `init()` with composite primary key `(placeholder_id, pathname)` and columns: `type`, `asset_key`, `text_content`, `link_url`, `updated_at`. The sentinel check uses `raurus_placeholders` to detect whether initialization already ran.
- `@orpc/server` is used for the `RPCHandler` import at `@orpc/server/fetch`
