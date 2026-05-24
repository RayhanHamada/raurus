# Package Agent Guide

## Package Context

This package is `@raurus/permissions-basic`, the V0 basic permissions adapter.

## Package Standards

- Keep the adapter focused on delegating `canEdit` checks to caller-provided logic
- Avoid introducing authentication framework integrations or user models in this package
- Keep public exports explicit through `src/index.ts`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Update this file when package-specific configuration expectations change

## Package Notes

- This package is intentionally thin and should stay thin in V0
