# Example: Server

`@raurus/example-server` lives in `examples/example-server/`. It is a minimal Bun app that boots the `@raurus/server` runtime without any adapters, validating that the server package starts and serves endpoints. Adapter configuration is left to the consumer.

```
examples/example-server/
├── src/
│   └── index.ts      # Bun entry point — calls raurus({…}), exports { port: 3000, fetch }
├── package.json
└── tsconfig.json
```

## Key Concepts

- Imports `raurus` from `@raurus/server` — the single public factory for creating a fetch-compatible runtime
- Passes `baseUrl: "http://localhost:3000"` to `raurus()` with no adapters — only the health check route is available (other routes return `501`)
- Because the URL pathname is `/`, the runtime derives its API base path as `_raurus`, so endpoints are served under `http://localhost:3000/_raurus/...`
- Exports a default Bun server object `{ port: 3000, fetch }` where `fetch` comes from `server.fetch`
- The OpenAPI spec is served at `/openapi.json` and Scalar docs at `/docs`, both under the derived `_raurus` prefix

## Routes Available

| Method | Path | Description  |
| ------ | ---- | ------------ |
| `GET`  | `/`  | Health check |

## Workflow

- `bun run dev` starts the server on port 3000 with hot reload
- `bun run typecheck` verifies TypeScript compilation
- Build dependencies first with `bun run build` at the repo root
