# Package Agent Guide

## Package Context

This package is `@raurus/logger`, a thin wrapper around [LogTape](https://logtape.org/) that provides shared logger instances and a pre-built `Config` object for every Raurus workspace package. It is the single source of truth for logging across the monorepo.

## Architecture

The package is intentionally small and flat:

```
src/
├── config.ts         # logTapeConfig (Config) + per-package level tables
├── get-logger.ts     # getLogger / getPackageLogger factories
├── index.ts          # Public barrel export
├── config.test.ts    # Vitest tests for the config object
└── get-logger.test.ts# Vitest tests for the logger factories
```

## Key Concepts

- **Categories** — Every log is namespaced under the `["raurus", <packageName>]` category. Use `getPackageLogger("<name>")` to grab a logger for a known package, or `getLogger(...subPath)` to add a deeper sub-category.
- **`logTapeConfig`** — A ready-to-use `Config` object that consumers pass to LogTape's `configure()` function. It defines a `console` sink (with `ansiColorFormatter`), one logger per package in `RaurusPackageNames`, and a `noDebugFromOthers` filter.
- **Library philosophy** — Per the LogTape guidance, this package **never calls `configure()` itself**. The consuming application is responsible for wiring up LogTape once at startup. The package only provides loggers and a config object.

## Package Standards

- Do **not** call `await configure(...)` or `configureSync(...)` anywhere in this package — exporting a `Config` object is the entire point
- Keep `RaurusPackageNames` in sync with the actual `@raurus/*` workspace packages. Add a new entry whenever a new package is added to `packages/`
- The `["raurus"]` root category is reserved for this package's own loggers; do not use it directly
- All new logger factories must re-export the `Logger` type from `@logtape/logtape` so consumers can type their return values
- Treat `logTapeConfig` as immutable from a consumer's perspective — applications that need different sinks or levels should spread and override, not mutate

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (uses tsdown with exports mode)
- Run tests with `bun run test` (vitest)
- Type-check with `bun run typecheck`

## Package Notes

- This package depends only on `@logtape/logtape` — file sinks, OpenTelemetry, Sentry, and other integrations should be added to `logTapeConfig` in `config.ts` only if every consuming app needs them
- `@raurus/server` is a consumer of this package; add it to `RaurusPackageNames` if it ever needs its own dedicated log level entry (it is already covered by the `server` entry)
- The `developmentLogLevels` / `productionLogLevels` maps default every package to `debug` in dev and `info` in prod; override per package by mutating these exports before passing `logTapeConfig` to `configure()`
- `process.env.NODE_ENV` is read at module evaluation time. If you need runtime reconfiguration, build your own `Config` by spreading `logTapeConfig` and overriding `loggers`
