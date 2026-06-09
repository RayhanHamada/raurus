# Package Agent Guide

## Package Context

This package is `@raurus/server`, a contract-first, OpenAPI-driven HTTP server built on Hono, itty-spec, and valibot. It provides a fetch-compatible router, a generated OpenAPI 3.1 document, and a built-in Scalar API reference.

## Architecture

```
src/
├── config.ts     # OpenAPI metadata, spec path, and default runtime options
├── contract.ts   # API contract defined with itty-spec + valibot schemas
├── index.ts      # Public barrel export for runtime, config, and generated spec
├── openapi.json  # Generated OpenAPI document written at build time
├── runtime.ts    # createRuntime() — wires handlers and Scalar docs
└── types.ts      # Public type definitions (CreateRaurusOptions)

tsdown.config.ts     # Build config and OpenAPI generation hook
```

## Key Concepts

- **Contract-first design** — The API surface is defined as a `const`-asserted contract object in `contract.ts` using `createContract` from itty-spec
- **valibot schemas** — All request/response validation uses valibot (`v.pipe`, `v.object`, `v.string`, etc.)
- **OpenAPI generation** — `tsdown.config.ts` writes `src/openapi.json` in a `build:before` hook via `createOpenApiSpecification`
- **Public OpenAPI export** — `src/index.ts` re-exports the generated spec as `openapi`
- **Scalar docs** — The runtime serves a Scalar API reference at `/docs` using `@scalar/server-side-rendering`
- **Fetch-compatible** — `createRuntime()` returns `{ fetch }`, compatible with Bun, Cloudflare Workers, and other WinterCG runtimes

## Package Standards

- Define all API endpoints as entries in the contract object — never add routes directly outside the contract
- Use valibot for all request/response schema validation, not zod or manual validation
- Keep handlers in `runtime.ts` wired through itty-spec's `createRouter`
- Keep OpenAPI generation in `tsdown.config.ts`; do not reintroduce a separate generator script unless the build flow changes materially
- When `src/contract.ts` or `src/config.ts` changes, regenerate `src/openapi.json` by running the package build before finishing
- Export public types from `src/types.ts`, runtime from `src/runtime.ts`, and the generated spec from `src/index.ts`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (writes `src/openapi.json` before bundling)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- The build uses tsdown with `unrun` as the config loader
- Output is a single `dist/index.mjs` entry point
- Handlers are currently stubs returning `{ message: "OK" }` — wire them to `@raurus/core` adapters when those are implemented
- The singleton `cachedRouter` pattern ensures repeated calls to `createRuntime()` return the same instance
- `CreateRaurusOptions` includes `docsPath`, but the runtime currently mounts the API reference at `/docs`; keep the type surface and runtime behavior aligned if either side changes
