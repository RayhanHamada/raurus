# Package Agent Guide

## Package Context

This package is `@raurus/storage-local`, the V0 local filesystem storage adapter.

## Package Standards

- Keep the adapter limited to local filesystem upload and delete behavior
- Preserve file extension handling and deterministic public URL construction
- Keep public exports explicit through `src/index.ts`
- Keep the local `tsconfig.json` extending `@raurus/tsconfig` and only add adapter-specific compiler overrides locally

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Update this file when storage-specific setup or operational guidance changes

## Package Notes

- The adapter is intended for the V0 local development workflow
- Uploaded files are expected to be served by the host application from a configured public path
