# Package Agent Guide

## Package Context

This package is `@raurus/server`, a contract-first, OpenAPI-driven HTTP server built on Elysia with `@elysia/openapi`. It provides a fetch-compatible router, a runtime-generated OpenAPI 3.1 document, and a built-in Scalar API reference.

## Architecture

```
src/
├── index.ts             # Public barrel — re-exports from src/runtime/
└── runtime/
    ├── index.ts          # Named export: raurus (alias for createRuntime)
    ├── models.ts         # Elysia TypeSystem schemas (t.Object, t.String, etc.)
    ├── routes.ts         # Route plugin — composable Elysia instance taking adapter options
    └── utils.ts          # createRuntime() — inline OpenAPI config, route composition, fetch handle

tsdown.config.ts          # Build config — entry: ["src/index.ts", "src/*/index.ts"]
```

## Key Concepts

- **Single public export** — `raurus()` from `@raurus/server` is the only entry point. It creates a fetch-compatible runtime from adapter options.
- **Route options** — `routes.ts` takes `RouteOptions` with `metadata` and `storage` adapter objects directly, rather than receiving them through Elysia decorate/store.
- **Inline OpenAPI** — The `@elysia/openapi` plugin is configured inline in `utils.ts` with server URL derived from `origin + basePath`.
- **Schema modules** — `models.ts` exports plain Elysia TypeSystem schemas. Routes import and reference them directly (e.g. `query: PresignedUrlQuerySchema`).
- **Fetch-compatible** — `createRuntime()` returns `{ fetch }`, compatible with Bun, Cloudflare Workers, and other WinterCG runtimes.

## Package Standards

- Keep runtime logic under `src/runtime/` — `src/index.ts` is only a barrel re-export
- Define schemas in `models.ts` using `t.Object()` / `t.String()` etc. from Elysia's TypeSystem
- Pass adapter dependencies to `routes()` via `RouteOptions`, not through Elysia state
- Inline OpenAPI metadata (title, version, servers) in `utils.ts` — no separate config module
- Export the runtime factory as `raurus` from `src/runtime/index.ts`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes
- Build with `bun run build` (tsdown with ESM output)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- Build uses tsdown with entries `src/index.ts` and `src/*/index.ts` — new runtime subdirectories are auto-picked up
- Routes currently use adapter guard clauses for optional methods (createPresignedUploadUrl, uploadAsset)
- Handlers are stubbed in their responses — wire to full adapter logic when ready
