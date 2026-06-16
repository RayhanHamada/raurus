# Example: Server

`@raurus/example-server` lives in `examples/example-server/`. It is a minimal Bun app that boots the `@raurus/server` runtime with in-memory adapter implementations from `@raurus/server/adapters/example-metadata-adapter` and `@raurus/server/adapters/example-storage-adapter`. It validates that the server package builds, starts, and serves endpoints correctly.

## Architecture

```
examples/example-server/
├── src/
│   └── index.ts      # Bun entry point — calls raurus({…}), exports { port: 3000, fetch }
├── package.json
└── tsconfig.json
```

## Key Concepts

- Imports `createMemoryMetadataAdapter` from `@raurus/server/adapters/example-metadata-adapter`
- Imports `createMemoryStorageAdapter` from `@raurus/server/adapters/example-storage-adapter`
- Imports `raurus` from `@raurus/server` — the single public factory for creating a fetch-compatible runtime
- Passes `baseUrl: "http://localhost:3000"` plus `metadataAdapter` and `storageAdapter` to `raurus()`; because the URL pathname is `/`, the runtime derives its API base path as `_raurus`, so endpoints are served under `http://localhost:3000/_raurus/...`
- Exports a default Bun server object `{ port: 3000, fetch }` where `fetch` comes from `server.fetch`
- The OpenAPI spec is served at `/openapi.json` and Scalar docs at `/docs`, both under the derived `_raurus` prefix

## Workflow

- `bun run dev` starts the server on port 3000 with hot reload
- `bun run typecheck` verifies TypeScript compilation
- Build dependencies first with `bun run build` at the repo root
