# Package Agent Guide

## Package Context

This package is `@raurus/storage-local`, a local filesystem storage adapter for the Raurus framework. It implements the `RuntimeStorageAdapter` contract from `@raurus/core` using Node.js built-in `fs` APIs.

## Architecture

```
src/
└── index.ts        # Factory + adapter implementation
```

## Key Concepts

- **Factory** — `createLocalStorageAdapter({ basePath: string })` creates a storage adapter backed by the local filesystem.
- **Asset storage** — Files are written to `{basePath}/{assetKey}`. Directories are created recursively via `mkdir(dirname, { recursive: true })`.
- **Asset content** — `getAssetContent(assetKey)` reads the file from disk and detects `contentType` from the file extension. Returns `{ data: ArrayBuffer; contentType: string }`.
- **Content type detection** — A static mapping of extensions (`.jpg`, `.png`, `.gif`, `.webp`, `.svg`, `.mp4`, `.webm`, `.mov`, `.avi`) to MIME types. Falls back to `application/octet-stream`.
- **Presigned URLs** — `createPresignedUploadUrl` returns `/_raurus/upload-asset?assetKey=...` and `createPresignedDownloadUrl` returns `/_raurus/asset-content/...`. These are simple route URL hints, not cryptographically presigned (local storage doesn't need S3-style presigning).
- **Error handling** — `ENOENT` on `deleteAsset` and `getAssetContent` maps to `code: "NOT_FOUND"`. All other errors map to `code: "CONNECTION"`.

## Conventions

- Extends `RuntimeStorageAdapterBaseConfig` from `@raurus/core` for the config interface
- Adapter `id` is the branded string literal `"local-storage-adapter"`
- Implements all five optional storage methods: `uploadAsset`, `deleteAsset`, `getAssetContent`, `createPresignedUploadUrl`, `createPresignedDownloadUrl`
- Implements `apiVersion: "1"` and `checkConnection()` per the `CommonRuntimeAdapter` contract
- All adapter methods return `AdapterMethodResult<T>` (discriminated union on `ok`)
- Uses `platform: "node"` in tsdown config since it depends on `node:fs` builtins

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (tsdown with ESM output)
- Type-check with `bun run typecheck`
