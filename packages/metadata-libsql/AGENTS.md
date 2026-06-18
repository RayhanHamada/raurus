# Package Agent Guide

## Package Context

This package is `@raurus/metadata-libsql`, a libsql-based metadata storage adapter for the Raurus framework. It implements the `RuntimeMetadataAdapter` contract from `@raurus/core` using `@libsql/client`.

## Architecture

```
src/
└── index.ts        # Factory + adapter implementation
```

## Key Concepts

- **Factory** — `createLibsqlMetadataAdapter({ url: string, authToken?: string })` creates a metadata adapter backed by libsql. The `authToken` is optional (e.g., for local file-based databases).
- **Auto-schema** — On construction, the adapter runs `CREATE TABLE IF NOT EXISTS raurus_metadata` with columns: `placeholder_id TEXT PRIMARY KEY`, `type TEXT NOT NULL`, `asset_key TEXT`, `text_content TEXT`, `updated_at TEXT NOT NULL DEFAULT (datetime('now'))`.
- **CRUD operations** — All four required metadata adapter methods are implemented:
    - `getMetadataByPlaceholderId(id)` → `SELECT` single row, maps to `RaurusMetadata` or `null`
    - `bulkGetMetadataByPlaceholderIds(ids)` → `SELECT WHERE placeholder_id IN (...)`. Empty array returns all rows.
    - `upsertContentMetadata` → `INSERT ... ON CONFLICT DO UPDATE SET ...` for both photo/video (asset_key) and text (text_content) variants. When switching type, nulls out the other column.
- **Row mapping** — The internal `rowToRaurusMetadata()` helper maps database rows to the `RaurusMetadata` discriminated union. Photo/video rows expose `assetKey`; text rows expose `text`.
- **Connection check** — `checkConnection()` executes `SELECT 1` to verify the database is reachable. On failure, returns `code: "CONNECTION"`.

## Conventions

- Extends `RuntimeMetadataAdapterBaseConfig` from `@raurus/core` for the config interface
- Adapter `id` is the branded string literal `"libsql-metadata-adapter"`
- Implements all required metadata methods: `getMetadataByPlaceholderId`, `bulkGetMetadataByPlaceholderIds`, `upsertContentMetadata` (two overloads)
- Implements `apiVersion: "1"` and `checkConnection()` per the `CommonRuntimeAdapter` contract
- All adapter methods return `AdapterMethodResult<T>` (discriminated union on `ok`)
- Uses parameterized queries (`?` placeholders) for all SQL to prevent injection

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (tsdown with ESM output)
- Type-check with `bun run typecheck`
