# Package Agent Guide

## Package Context

This package is `@raurus/auth-simple-password`, a simple password-based authentication adapter for the Raurus framework. It implements the `RuntimeAuthAdapter` contract from `@raurus/core`.

## Architecture

```
src/
└── index.ts        # Factory + adapter implementation
```

## Key Concepts

- **Factory** — `createSimplePasswordAuth({ password: string })` creates an auth adapter with in-memory token storage.
- **Authentication** — On `authenticate(password)`, compares the plain password string. On match, generates a `crypto.randomUUID()` token and stores it in a `Map<string, number>` (token → timestamp). On mismatch, returns `{ ok: false, code: "PERMISSION" }`.
- **Token validation** — On `validateToken(token)`, checks if the token exists in the in-memory Map. No expiry logic in MVP — tokens survive until process restart.
- **In-memory only** — Tokens are not persisted. A server restart requires re-login.

## Conventions

- Extends `RuntimeAuthAdapterBaseConfig` from `@raurus/core` for the config interface
- Adapter `id` is the branded string literal `"simple-password-auth-adapter"`
- Implements `apiVersion: "1"` and `checkConnection()` per the `CommonRuntimeAdapter` contract
- All adapter methods return `AdapterMethodResult<T>` (discriminated union on `ok`)

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (tsdown with ESM output)
- Type-check with `bun run typecheck`
