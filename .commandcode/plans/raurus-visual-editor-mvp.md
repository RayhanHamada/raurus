# Raurus Visual Editor MVP — Implementation Plan

## Overview

Build the MVP of a framework-agnostic visual editing system for web apps. The backing runtime (`@raurus/server`) already serves `/_raurus` routes for storage operations. This plan adds: auth, metadata CRUD on the server, three real adapter packages, and a React editing UI layer in `@raurus/react`.

**MVP scope:** React + Next.js, local file storage, libsql metadata, simple password auth, in-page editing UI with overlay, direct-save (no draft).

---

## Phase 1 — Core: Auth Adapter Contract

**Package:** `packages/core/src/types.ts`

Add new types after the existing storage adapter section (before factories):

```ts
// Auth adapter contract
export interface RuntimeAuthAdapterBaseConfig {}

export interface RuntimeAuthAdapter extends CommonRuntimeAdapter {
    id: `${Lowercase<string>}-auth-adapter`;
    authenticate: (password: string) => Promise<AdapterMethodResult<{ token: string }>>;
    validateToken: (token: string) => Promise<AdapterMethodResult<{ valid: boolean }>>;
}

export type RaurusAuthAdapterId = `${Lowercase<string>}-auth-adapter`;

export type RuntimeAuthAdapterFactory<
    Config extends RuntimeAuthAdapterBaseConfig = RuntimeAuthAdapterBaseConfig,
    AdapterId extends RaurusAuthAdapterId = RaurusAuthAdapterId,
> = (config?: Config) => RuntimeAuthAdapter & { readonly __adapterId?: AdapterId };
```

Also add `getAssetContent` as an optional method to `RuntimeStorageAdapter`:

```ts
export interface RuntimeStorageAdapter extends CommonRuntimeAdapter {
    // ... existing methods ...
    getAssetContent?: (assetKey: string) => Promise<AdapterMethodResult<{ data: Uint8Array; contentType: string }>>;
}
```

Re-export all new types from `src/index.ts`. Add type tests in `src/types.test.ts`.

---

## Phase 2 — Server: Auth Routes, Metadata CRUD, Asset Serving, Upload Fix

**Package:** `packages/server`

### 2a. RouteOptions & CreateRuntimeOptions — add authAdapter

- `src/runtime/routes.ts`: Add `auth?: RuntimeAuthAdapter` to `RouteOptions`
- `src/runtime/utils.ts`: Add `authAdapter?: RuntimeAuthAdapter` to `CreateRuntimeOptions`
- Pass `authAdapter` through to `routes()`

### 2b. Auth macro (`checkAuth`)

Add a new macro alongside `checkMetadata`/`checkStorage` in `routes.ts`:

```
checkAuth(enable: boolean)
  → beforeHandle: reads Authorization: Bearer <token> header
    → calls auth.validateToken(token)
    → if missing/invalid: returns 401
  → resolve: narrows auth type
```

### 2c. New routes in `routes.ts`

| Method | Path | Auth Guarded | Description |
|--------|------|-------------|-------------|
| `POST` | `/auth/login` | No | Accepts `{ password }` → calls `auth.authenticate` → returns `{ token }` |
| `GET` | `/auth/verify` | `checkAuth` | Validates current token → returns `{ valid: true }` or 401 |
| `GET` | `/metadata` | `checkAuth` | Lists all metadata (calls `bulkGetMetadataByPlaceholderIds` for all known ids). Add optional query `?placeholderIds=a,b,c` for filtering. |
| `GET` | `/metadata/:placeholderId` | `checkAuth` | Gets single metadata record → 404 if null |
| `PUT` | `/metadata/:placeholderId` | `checkAuth` + `checkMetadata` | Body: `{ type: "photo"\|"video", assetKey }` or `{ type: "text", text }` → calls `upsertContentMetadata` |
| `GET` | `/asset-content/:assetKey` | No (public) | Calls `storage.getAssetContent(assetKey)` → streams response with content-type header. If method absent → 501. Public so images render without auth. |

### 2d. Fix `POST /upload-asset`

Currently returns OK without processing. Change to:
- Accept multipart form with `files` field
- Read first file as `ArrayBuffer`
- Generate unique `assetKey` (uuid + original extension)
- Call `storage.uploadAsset(assetKey, buffer)`
- If method absent → return 501
- On success: return `{ assetKey }`

### 2e. Elysia schemas in `models.ts`

Add schemas for new route bodies/responses:
- `LoginBodySchema` — `t.Object({ password: t.String() })`
- `LoginResponseSchema` — `t.Object({ message: t.Literal("OK"), data: t.Object({ token: t.String() }) })`
- `VerifySessionResponseSchema` — `t.Object({ message: t.Literal("OK"), data: t.Object({ valid: t.Literal(true) }) })`
- `MetadataResponseSchema` — typed metadata object
- `UpsertMetadataBodySchema` — discriminated union matching `RaurusMetadata` (photo/video with assetKey, text with text)
- `UploadAssetResponseSchema` — add `assetKey` field

### 2f. Route auth macro wiring

All metadata routes use `checkAuth: true`. The `GET /asset-content/:assetKey` route is public (no auth) so images display for all visitors. The upload and presigned URL routes should also be auth-guarded (only admins can upload/delete).

Update existing routes:
- `GET /presigned-url` → add `checkAuth: true`
- `GET /presigned-download-url` → add `checkAuth: true`
- `DELETE /asset/:assetKey` → add `checkAuth: true`
- `POST /upload-asset` → add `checkAuth: true`
- `GET /` (health) → no auth (public)
- `GET /asset-content/:assetKey` → no auth (public, needed for image display)

### 2g. Regenerate OpenAPI types

After route changes, run `bun run typegen` in `packages/client` to regenerate `src/openapi.gen.ts`.

---

## Phase 3 — Adapter Packages

Three new workspace packages, each with minimal structure.

### 3a. `@raurus/auth-simple-password` (`packages/auth-simple-password`)

**Dependencies:** `@raurus/core` (workspace), `@raurus/logger` (workspace)
**No runtime deps beyond crypto (built-in)**

Factory: `createSimplePasswordAuth({ password: string })`

```ts
export const createSimplePasswordAuth: RuntimeAuthAdapterFactory<SimplePasswordAuthConfig, "simple-password-auth-adapter"> = (config) => ({
    apiVersion: "1",
    id: "simple-password-auth-adapter",
    checkConnection: async () => ({ ok: true, data: null }),
    authenticate: async (password) => { /* compare + generate token */ },
    validateToken: async (token) => { /* lookup token in Map */ },
});
```

Token strategy: on `authenticate`, compare password (plain string, no bcrypt for MVP), if match generate a crypto.randomUUID() token, store in a `Map<string, number>` (token → timestamp). On `validateToken`, check token exists in map. In-memory only — restart = re-login.

**Files:**
- `packages/auth-simple-password/package.json`
- `packages/auth-simple-password/tsconfig.json` (extends `@raurus/tsconfig`)
- `packages/auth-simple-password/tsdown.config.ts`
- `packages/auth-simple-password/src/index.ts`

### 3b. `@raurus/storage-local` (`packages/storage-local`)

**Dependencies:** `@raurus/core` (workspace), `@raurus/logger` (workspace)
**Runtime:** `node:fs/promises`, `node:path`, `node:crypto`

Factory: `createLocalStorageAdapter({ basePath: string })`

Implements: `uploadAsset`, `deleteAsset`, `getAssetContent`, `createPresignedUploadUrl`, `createPresignedDownloadUrl`

- `uploadAsset(assetKey, data)` → write file to `{basePath}/{assetKey}`, create dirs if needed
- `deleteAsset(assetKey)` → unlink file, return `NOT_FOUND` if missing
- `getAssetContent(assetKey)` → read file, detect content-type from extension (simple mapping), return buffer + contentType
- `createPresignedUploadUrl(assetKey)` → return `{ url: `/_raurus/upload-asset?assetKey=${assetKey}` }` (not really presigned, just a hint URL for the client)
- `createPresignedDownloadUrl(assetKey)` → return `{ url: `/_raurus/asset-content/${assetKey}` }`

For presigned URLs: since this is local storage, they don't serve the same security purpose as S3 presigned URLs. They simply return the server route URLs the client should use.

**Files:**
- `packages/storage-local/package.json`
- `packages/storage-local/tsconfig.json` (extends `@raurus/tsconfig`)
- `packages/storage-local/tsdown.config.ts`
- `packages/storage-local/src/index.ts`

### 3c. `@raurus/metadata-libsql` (`packages/metadata-libsql`)

**Dependencies:** `@raurus/core` (workspace), `@raurus/logger` (workspace), `@libsql/client`

Factory: `createLibsqlMetadataAdapter({ url: string, authToken?: string })`

On init: create `raurus_metadata` table if not exists:
```sql
CREATE TABLE IF NOT EXISTS raurus_metadata (
    placeholder_id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    asset_key TEXT,
    text_content TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Implements: `getMetadataByPlaceholderId`, `bulkGetMetadataByPlaceholderIds`, `upsertContentMetadata`, `checkConnection`

- `checkConnection()` → execute `SELECT 1` to verify db connection
- `getMetadataByPlaceholderId(id)` → SELECT and map to `RaurusMetadata` or null
- `bulkGetMetadataByPlaceholderIds(ids)` → SELECT WHERE placeholder_id IN (...)
- `upsertContentMetadata` → INSERT OR REPLACE based on type (photo/video → asset_key, text → text_content)

Row-to-RaurusMetadata mapping:
- type "photo" | "video" → `{ placeholderId, type, assetKey: row.asset_key }`
- type "text" → `{ placeholderId, type: "text", text: row.text_content }`

**Files:**
- `packages/metadata-libsql/package.json`
- `packages/metadata-libsql/tsconfig.json` (extends `@raurus/tsconfig`)
- `packages/metadata-libsql/tsdown.config.ts`
- `packages/metadata-libsql/src/index.ts`

---

## Phase 4 — React Editing UI (`packages/react`)

### 4a. Dependencies

Add `@raurus/core` as a workspace dependency (for types like `RaurusMetadata`).

### 4b. `RaurusProvider` — context + config

```tsx
interface RaurusProviderProps {
    baseUrl: string;       // e.g. "/_raurus" — passed to createApiClient
    children: React.ReactNode;
}

// Context value:
interface RaurusContextValue {
    client: ReturnType<typeof createApiClient>;
    isEditing: boolean;
    authToken: string | null;
    selectedPlaceholderId: string | null;
    login: (password: string) => Promise<boolean>;
    logout: () => void;
    enterEditMode: () => void;
    exitEditMode: () => void;
    selectPlaceholder: (id: string) => void;
    getPlaceholderIds: () => string[];
    registerPlaceholder: (id: string) => void;
    updateContent: (id: string, data: ...) => Promise<void>;
}
```

The provider:
1. Creates `createApiClient({ baseUrl })` instance
2. Stores `authToken` in state (and localStorage for persistence)
3. Sets `Authorization` header on the client when token changes
4. Tracks registered placeholder IDs (for the dropdown in the overlay)
5. Provides `login()` that calls `POST /auth/login` → stores token
6. Provides `enterEditMode()` that calls `GET /auth/verify` to validate token before activating

### 4c. `useEditMode()` hook

Returns `{ isEditing, enterEditMode, exitEditMode, login, logout, isAuthenticated }` from context.

### 4d. `useContent(placeholderId: string)` hook

Returns `{ content: RaurusMetadata | null, isLoading, error, update: (data) => Promise<void> }`.

On mount: fetches `GET /metadata/:placeholderId` → stores in state.
`update()`: calls `PUT /metadata/:placeholderId` with new data → refetches.

### 4e. `<EditableImage>` component

```tsx
interface EditableImageProps {
    placeholderId: string;
    fallback?: string;         // URL to show when no content
    className?: string;
    // ...any other img props
}
```

Behavior:
1. Fetches content via `useContent(placeholderId)`
2. Renders `<img src={assetUrl} />` where `assetUrl = baseUrl + '/asset-content/' + assetKey` (from metadata)
3. When `isEditing`: wraps in a div with colored dashed border, onClick → calls `selectPlaceholder(placeholderId)`
4. When not editing: renders plain `<img>` (no border)

### 4f. `<EditableText>` component

```tsx
interface EditableTextProps {
    placeholderId: string;
    as?: "h1" | "h2" | "h3" | "p" | "span";
    fallback?: string;
    className?: string;
}
```

Same pattern as EditableImage but for text. Renders the `text` from metadata. Shows highlight border when editing.

### 4g. `<EditableVideo>` component

Same pattern as EditableImage, renders `<video>` with `src` from assetKey.

### 4h. `<LoginButton>` component

Floating button in bottom-right corner. Hidden (opacity 0, small) until hovered → reveals "Edit" text. On click → opens `<AuthModal>`.

### 4i. `<AuthModal>` component

Simple modal overlay with:
- Password input field
- Login button → calls `login(password)` from context
- Error message display
- On success → auto-closes, enters edit mode

### 4j. `<EditOverlay>` component

The main editing panel. Only rendered when `isEditing` is true.

Structure:
- A floating panel (drawer) — CSS positioned `fixed`, with transitions
- **Header**: "Editing: {selectedPlaceholderId}" with a dropdown to switch between registered placeholders
- **Content area** (depends on selected content type):
  - Photo/Video: image preview + "Replace" button that opens file picker → uploads → updates metadata
  - Text: textarea with current text + "Save" button
- **Save button**: calls `updateContent(placeholderId, data)` from context
- **Close button**: deselects placeholder, optionally exits edit mode

Upload flow for images:
1. User clicks "Replace" → `<input type="file" accept="image/*" />` triggered
2. File selected → read as ArrayBuffer
3. Call `POST /_raurus/upload-asset` with file → get `{ assetKey }`
4. Call `PUT /_raurus/metadata/:placeholderId` with `{ type: "photo", assetKey }`
5. Image preview updates

### 4k. Barrel exports

Update `src/index.ts`:
```ts
export { RaurusProvider, type RaurusProviderProps } from "./RaurusProvider";
export { useEditMode } from "./useEditMode";
export { useContent } from "./useContent";
export { EditableImage, type EditableImageProps } from "./EditableImage";
export { EditableText, type EditableTextProps } from "./EditableText";
export { EditableVideo, type EditableVideoProps } from "./EditableVideo";
export { LoginButton } from "./LoginButton";
export { EditOverlay } from "./EditOverlay";
```

Remove the `MyButton` demo component and its export.

### 4l. Styling approach

Use Tailwind CSS classes (already in the build pipeline via `@bosh-code/tsdown-plugin-tailwindcss`). Components ship with Tailwind classes statically extracted at build time — no runtime CSS-in-JS.

Key styles needed:
- Editable border: `border-2 border-dashed border-blue-500 cursor-pointer`
- Overlay panel: `fixed z-50 bg-white shadow-xl rounded-lg p-4`
- Login button: `fixed bottom-4 right-4 z-40 opacity-20 hover:opacity-100 transition-opacity`
- Modal backdrop: `fixed inset-0 bg-black/50 z-50 flex items-center justify-center`

### 4m. Remove MyButton

Delete `src/MyButton.tsx` and remove from `src/index.ts`. This is a starter placeholder.

---

## Phase 5 — Integration: Example Server Update

**Package:** `examples/example-server`

Update `src/index.ts` to use real adapters:

```ts
import { raurus } from "@raurus/server";
import { createLocalStorageAdapter } from "@raurus/storage-local";
import { createLibsqlMetadataAdapter } from "@raurus/metadata-libsql";
import { createSimplePasswordAuth } from "@raurus/auth-simple-password";

const server = raurus({
    baseUrl: "http://localhost:3000",
    metadataAdapter: createLibsqlMetadataAdapter({ url: "file:./data.db" }),
    storageAdapter: createLocalStorageAdapter({ basePath: "./uploads" }),
    authAdapter: createSimplePasswordAuth({ password: "admin123" }),
});
```

Add the new adapter packages as workspace dependencies in `examples/example-server/package.json`.

---

## Phase 5b — Example Next.js App (optional, post-MVP)

Create `examples/example-nextjs` showing the full integration:
- Next.js App Router with `/_raurus` API route mounting the server
- A landing page with editable hero image, headline, and feature cards
- `<RaurusProvider>` wrapping the layout
- `<LoginButton>` in bottom-right
- Editable content using `<EditableImage>`, `<EditableText>`, `<EditableVideo>`

---

## Files Changed (Complete List)

### Modified:

| File | Change |
|------|--------|
| `packages/core/src/types.ts` | Add `RuntimeAuthAdapter*`, `getAssetContent` to storage adapter |
| `packages/core/src/index.ts` | Re-export new types |
| `packages/core/src/types.test.ts` | Test new auth types + getAssetContent |
| `packages/server/src/runtime/routes.ts` | Add checkAuth macro, auth routes, metadata routes, asset-content route, fix upload-asset, add auth to existing routes |
| `packages/server/src/runtime/models.ts` | Add schemas for new routes |
| `packages/server/src/runtime/utils.ts` | Add `authAdapter` to CreateRuntimeOptions, pass to routes |
| `packages/server/package.json` | Add new adapter exports entries (or just rely on separate packages) |
| `packages/client/src/openapi.gen.ts` | Regenerated via typegen |
| `packages/react/package.json` | Add `@raurus/core` dependency |
| `packages/react/src/index.ts` | Replace MyButton with new component exports |
| `examples/example-server/src/index.ts` | Use real adapters |
| `examples/example-server/package.json` | Add adapter package dependencies |

### Created:

| File | Purpose |
|------|---------|
| `packages/auth-simple-password/package.json` | New package manifest |
| `packages/auth-simple-password/tsconfig.json` | TS config (extends @raurus/tsconfig) |
| `packages/auth-simple-password/tsdown.config.ts` | Build config |
| `packages/auth-simple-password/src/index.ts` | Auth adapter implementation |
| `packages/storage-local/package.json` | New package manifest |
| `packages/storage-local/tsconfig.json` | TS config |
| `packages/storage-local/tsdown.config.ts` | Build config |
| `packages/storage-local/src/index.ts` | Local storage adapter |
| `packages/metadata-libsql/package.json` | New package manifest |
| `packages/metadata-libsql/tsconfig.json` | TS config |
| `packages/metadata-libsql/tsdown.config.ts` | Build config |
| `packages/metadata-libsql/src/index.ts` | libsql metadata adapter |
| `packages/react/src/RaurusProvider.tsx` | React context provider |
| `packages/react/src/useEditMode.ts` | Edit mode hook |
| `packages/react/src/useContent.ts` | Content fetch/update hook |
| `packages/react/src/EditableImage.tsx` | Editable image component |
| `packages/react/src/EditableText.tsx` | Editable text component |
| `packages/react/src/EditableVideo.tsx` | Editable video component |
| `packages/react/src/LoginButton.tsx` | Hidden login trigger |
| `packages/react/src/AuthModal.tsx` | Login modal |
| `packages/react/src/EditOverlay.tsx` | Editing panel overlay |

### Deleted:

| File | Reason |
|------|--------|
| `packages/react/src/MyButton.tsx` | Starter placeholder, replaced by real components |
| `packages/react/src/MyButton.test.tsx` | Deleted with MyButton |

---

## Verification

After implementation, verify with:

1. **Build all packages:** `bun run build` at root → all packages compile without errors
2. **Type-check:** `bun run typecheck` → clean
3. **Tests:** `bun run test` → all existing tests pass, new adapter tests run
4. **Example server:** `cd examples/example-server && bun run src/index.ts` → server starts, `curl http://localhost:3000/_raurus/` returns health check
5. **Auth flow:** `curl -X POST http://localhost:3000/_raurus/auth/login -H 'Content-Type: application/json' -d '{"password":"admin123"}'` → returns token
6. **Metadata CRUD:** `curl http://localhost:3000/_raurus/metadata/hero -H 'Authorization: Bearer <token>'` → returns 404 (no data yet)
7. **Upload + metadata:** upload a file → get assetKey → PUT metadata → GET metadata returns correct data
8. **Asset serving:** `curl http://localhost:3000/_raurus/asset-content/<assetKey>` → returns the uploaded file
9. **React build:** `cd packages/react && bun run build` → builds without errors
10. **OpenAPI docs:** visit `http://localhost:3000/_raurus/docs` → all new routes appear in Scalar UI

---

## Architecture Decisions

1. **Auth tokens are in-memory UUIDs** — simple Map lookup. Restart = re-login. No JWT complexity for MVP. The adapter contract is generic enough to swap in JWT/OAuth later.
2. **`getAssetContent` is an optional storage method** — follows the existing "menu of optional methods" pattern. Adapters that can serve files implement it; others return 501.
3. **Asset serving is public (no auth)** — images need to display for all visitors, not just admins.
4. **Presigned URLs for local storage** point to server routes — not cryptographically presigned, just URL hints. The adapter contract preserves the method name for S3 compatibility later.
5. **Text content stored in metadata, not as files** — this matches the existing `RaurusMetadata` discriminated union (text variant has `text: string`). No storage adapter involvement for text.
6. **Three separate adapter packages** — follows the taste guidance (implementations in workspace packages) and the user's stated preference for `@raurus/*` namespacing.
7. **No draft system in MVP** — user chose "direct save only." Metadata updates are immediate.
