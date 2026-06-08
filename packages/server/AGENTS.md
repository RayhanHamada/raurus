# Package Agent Guide

## Package Context

This package is `@raurus/server`, a contract-first, OpenAPI-driven HTTP server built on Hono, itty-spec, and valibot. It provides a fetch-compatible router with auto-generated OpenAPI 3.1 specification and built-in Swagger UI.

## Architecture

```
src/
├── types.ts      # Public type definitions (CreateRuntimeOptions)
├── config.ts     # OpenAPI metadata and default runtime options
├── contract.ts   # API contract defined with itty-spec + valibot schemas
├── runtime.ts    # createRuntime() — wires handlers, mounts Swagger UI
└── index.ts      # Public barrel export

generate-openapi.ts  # Build-time OpenAPI spec generation script
```

## Key Concepts

- **Contract-first design** — The API surface is defined as a `const`-asserted contract object in `contract.ts` using `createContract` from itty-spec
- **valibot schemas** — All request/response validation uses valibot (`v.pipe`, `v.object`, `v.string`, etc.)
- **OpenAPI generation** — `generate-openapi.ts` produces `openapi.json` at build time via `createOpenApiSpecification`
- **Swagger UI** — Mounted at the configured `docsPath` (default `/docs`) using `@hono/swagger-ui`
- **Fetch-compatible** — `createRuntime()` returns `{ fetch }`, compatible with Bun, Cloudflare Workers, and other WinterCG runtimes

## Package Standards

- Define all API endpoints as entries in the contract object — never add routes directly outside the contract
- Use valibot for all request/response schema validation, not zod or manual validation
- Keep handlers in `runtime.ts` wired through itty-spec's `createRouter`
- Run `generate-openapi.ts` as a `build:before` hook — the OpenAPI spec must be regenerated before each build
- Export public types from `src/types.ts` and re-export through `src/index.ts`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (triggers OpenAPI generation via tsdown's `build:before` hook)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- The build uses tsdown with `unrun` as the config loader
- Output is a single `dist/index.mjs` entry point
- Handlers are currently stubs returning `{ message: "OK" }` — wire them to `@raurus/core` adapters when those are implemented
- The singleton `cachedRouter` pattern ensures repeated calls to `createRuntime()` return the same instance
