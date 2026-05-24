# Package Agent Guide

## Package Context

This package is `@raurus/metadata-sqlite`, the V0 SQLite metadata adapter.

## Package Standards

- Keep the adapter focused on the `editable_assets` table and V0 metadata contract
- Prefer explicit row-to-type mapping over implicit database object usage
- Keep public exports explicit through `src/index.ts`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Update this file when adapter-specific setup or schema guidance changes

## Package Notes

- The adapter persists asset ID to stored asset mappings
- The V0 schema is intentionally narrow and should not evolve into a generic CMS model
