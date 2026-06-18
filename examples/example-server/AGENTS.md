# Example: Server

`@raurus/example-server` lives in `examples/example-server/`. It is a minimal Bun app that boots the `@raurus/server` runtime with real adapter implementations: `simple-password` (auth), `libsql` (metadata), and `local` (storage) — all imported from `@raurus/server/adapters/<category>`. It validates that the server package and its built-in adapters build, start, and serve endpoints correctly.

## Architecture

```
examples/example-server/
├── src/
│   └── index.ts      # Bun entry point — calls raurus({…}), exports { port: 3000, fetch }
├── package.json
└── tsconfig.json
```

## Key Concepts

- Imports `createSimplePasswordAuth` from `@raurus/server/adapters/auth` — password `"admin123"`, in-memory token storage
- Imports `createLibsqlMetadataAdapter` from `@raurus/server/adapters/metadata` — local SQLite file at `./data.db`
- Imports `createLocalStorageAdapter` from `@raurus/server/adapters/storage` — local filesystem storage at `./uploads`
- Imports `raurus` from `@raurus/server` — the single public factory for creating a fetch-compatible runtime
- Passes `baseUrl: "http://localhost:3000"` plus `metadataAdapter`, `storageAdapter`, and `authAdapter` to `raurus()`; because the URL pathname is `/`, the runtime derives its API base path as `_raurus`, so endpoints are served under `http://localhost:3000/_raurus/...`
- Exports a default Bun server object `{ port: 3000, fetch }` where `fetch` comes from `server.fetch`
- The OpenAPI spec is served at `/openapi.json` and Scalar docs at `/docs`, both under the derived `_raurus` prefix

## Routes Available

| Method   | Path                       | Auth         | Description                                                 |
| -------- | -------------------------- | ------------ | ----------------------------------------------------------- |
| `GET`    | `/`                        | Public       | Health check                                                |
| `POST`   | `/auth/login`              | Public       | Login with password → returns token                         |
| `GET`    | `/auth/verify`             | Bearer token | Verify session                                              |
| `GET`    | `/metadata`                | Bearer token | List metadata (optional `?placeholderIds`)                  |
| `GET`    | `/metadata/:placeholderId` | Bearer token | Get single metadata record                                  |
| `PUT`    | `/metadata/:placeholderId` | Bearer token | Upsert metadata (photo/video with assetKey, text with text) |
| `GET`    | `/asset-content/:assetKey` | Public       | Stream raw asset content                                    |
| `POST`   | `/upload-asset`            | Bearer token | Upload asset file → returns assetKey                        |
| `GET`    | `/presigned-url`           | Bearer token | Get presigned upload URL                                    |
| `GET`    | `/presigned-download-url`  | Bearer token | Get presigned download URL                                  |
| `DELETE` | `/asset/:assetKey`         | Bearer token | Delete asset                                                |

## Workflow

- `bun run dev` starts the server on port 3000 with hot reload
- `bun run typecheck` verifies TypeScript compilation
- Build dependencies first with `bun run build` at the repo root

## Notes

- `createLibsqlMetadataAdapter` auto-creates the `raurus_metadata` table on first connection
- `createLocalStorageAdapter` auto-creates the `uploads/` directory and any subdirectories on first write
- `createSimplePasswordAuth` stores tokens in memory only — tokens are lost on restart
- The `createLocalStorageAdapter` ships all five optional storage methods: `uploadAsset`, `deleteAsset`, `getAssetContent`, `createPresignedUploadUrl`, `createPresignedDownloadUrl`
