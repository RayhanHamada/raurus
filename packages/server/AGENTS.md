# Package Agent Guide

## Package Context

This package is `@raurus/server`, a contract-first, OpenAPI-driven HTTP server built on Elysia with `@elysia/openapi`. It provides a fetch-compatible router, a runtime-generated OpenAPI 3.0 document, and a built-in Scalar API reference.

## Architecture

```
src/
├── config.ts     # OpenAPI info metadata and default runtime options
├── index.ts      # Public barrel export
├── models.ts     # Elysia model plugin — TypeBox schemas registered with .model()
├── routes.ts     # Route plugin — composable Elysia instance defining all API routes
├── runtime.ts    # createRuntime() — composes Elysia app with inlined OpenAPI plugin and routes
└── types.ts      # Public type definitions (CreateRaurusOptions)

tsdown.config.ts  # Build config
```

## Key Concepts

- **Elysia plugins** — Each module exports a named Elysia instance (plugin). `runtime.ts` composes them via `.use()`. This follows Elysia's idiomatic pattern: each plugin is self-contained with its own name for deduplication.
- **Model references** — Schemas are registered with `.model()` in `models.ts` and referenced by name in `routes.ts` (e.g. `body: "uploadAssetBody"`). This avoids re-importing schemas and keeps route definitions clean.
- **OpenAPI setup** — The `@elysia/openapi` plugin is configured inline in `runtime.ts` using `OPENAPI_CONFIG` and `DEFAULT_RUNTIME_OPTIONS` from `config.ts`. Path derivation from `baseUrl` is handled in `createRuntime()`.
- **Fetch-compatible** — `createRuntime()` returns `{ fetch }`, compatible with Bun, Cloudflare Workers, and other WinterCG runtimes.

## Package Standards

- Schemas live in `models.ts` as a named Elysia plugin using `.model()`
- Routes live in `routes.ts` as a named Elysia plugin — uses string references for schemas
- OpenAPI setup is composed inline in `runtime.ts` using config values from `config.ts`
- `runtime.ts` is a thin composer — no inline route definitions
- Export public types from `types.ts`, runtime from `runtime.ts`, config from `config.ts`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes
- Build with `bun run build` (tsdown + unrun)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- Build uses tsdown with `unrun` config loader, ESM output to `dist/index.mjs`
- Handlers are currently stubs — wire them to `@raurus/core` adapters when those are implemented
