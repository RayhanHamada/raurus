# Example: Server

`@raurus/example-server` lives in `examples/server-example/`. It is a minimal Bun app that boots the `@raurus/server` runtime with in-memory adapter implementations from `@raurus/server/adapters/example-metadata-adapter` and `@raurus/server/adapters/example-storage-adapter`. It validates that the server package builds, starts, and serves endpoints correctly.

## Architecture

```
examples/server-example/
├── src/
│   └── index.ts      # Bun entry point — calls raurus({…}), exports { port: 3000, fetch }
├── package.json
└── tsconfig.json
```

## Key Concepts

- Imports `createMemoryMetadataAdapter` from `@raurus/server/adapters/example-metadata-adapter`
- Imports `createMemoryStorageAdapter` from `@raurus/server/adapters/example-storage-adapter`
- Imports `raurus` from `@raurus/server` — the single public factory for creating a fetch-compatible runtime
- Passes `metadataAdapter` and `storageAdapter` directly as options to `raurus()`
- Exports a default Bun server object `{ port: 3000, fetch }` where `fetch` comes from `server.fetch`

## Workflow

- `bun run dev` starts the server on port 3000 with hot reload
- `bun run typecheck` verifies TypeScript compilation
- Build dependencies first with `bun run build` at the repo root
