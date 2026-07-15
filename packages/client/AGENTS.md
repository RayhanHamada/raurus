# Package Agent Guide

## Package Context

`@raurus/client` is the typed RPC client for the Raurus API. It wraps `@orpc/client`'s `RPCLink` and `createORPCClient` to produce a fully-typed client that mirrors the procedure contracts defined in `@raurus/contract`.

This file extends the root [AGENTS.md](../AGENTS.md).

## Architecture

```
src/
├── index.ts          # Public barrel — createRaurusClient factory + RaurusClient interface
```

## Key Concepts

- **`createRaurusClient(url)`** — Factory that creates an `RPCLink` (fetch-based) pointing at the Raurus runtime and wraps it with `createORPCClient`. Returns a `RaurusClient` typed interface.
- **`RaurusClient`** — Explicitly typed interface with four procedure methods (`upsertMetadata`, `getPresignedUploadUrl`, `deleteAsset`, `listMetadataByPathname`), each accepting and returning types inferred from the Valibot schemas in `@raurus/contract`.
- **No build step** — This package has no tsdown config or build artifacts. It exports directly from `src/index.ts` via the `"exports"` field. Consumers import the raw TypeScript source.
- **Re-exports** — `contracts` and the `Contracts` type are re-exported from `@raurus/contract` for convenience.

## Package Standards

- Keep the `RaurusClient` interface in sync with the procedure contracts in `@raurus/contract` — when a new procedure is added to `contracts`, add a corresponding method signature here
- Do not add a build step or tsdown config — this package is consumed as raw TypeScript
- Do not introduce `@raurus/server` as a dependency — the client only depends on `@raurus/contract`
- `valibot` is a direct dependency (not just transitive via `@raurus/contract`) for importing `InferInput` to type the discriminated `metadataBodySchema`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes
- This package has no `build` or `test` scripts — only `typecheck` (`tsc --noEmit`)
- Run `bun run typecheck` at the root to verify this package alongside all others
