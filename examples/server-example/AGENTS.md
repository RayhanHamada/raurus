# Example: Server

`@raurus/example-server` lives in `examples/server-example/`. It is a minimal Bun app that boots the `@raurus/server` runtime with `@raurus/adapter-memory` implementations. It validates that the server package builds, starts, and serves endpoints correctly.

## Architecture

```
examples/server-example/
├── src/
│   └── index.ts      # Bun entry point — imports adapters, boots on port 3000
├── package.json
└── tsconfig.json
```

## Key Concepts

- Imports `createMemoryMetadataAdapter` and `createMemoryStorageAdapter` from `@raurus/adapter-memory`
- The server's handlers are stubs and do not currently call the adapters at runtime — the adapters are passed for type-safety and future wiring
- Exports a default Bun server object `{ port: 3000, fetch }` compatible with `Bun.serve`

## Workflow

- `bun run dev` starts the server on port 3000 with hot reload
- `bun run typecheck` verifies TypeScript compilation
- Build dependencies first with `bun run build` at the repo root
