# Raurus

[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.3-black?logo=bun&logoColor=white)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE.md)

Inline image editing without handing your UI to a CMS.

Raurus is a monorepo for a lightweight inline asset editing library for web apps.

It is built around a small framework-agnostic runtime, a thin React integration, and a set of V0 adapters for local development:

- `@raurus/core`: runtime for asset lookup, replacement, removal, validation, and permission checks
- `@raurus/react`: `RaurusProvider` and `EditableAsset` for React apps
- `@raurus/storage-local`: local filesystem storage adapter
- `@raurus/metadata-sqlite`: SQLite metadata adapter
- `@raurus/permissions-basic`: basic permission adapter
- `apps/playground-react`: end-to-end playground for the V0 editing flow
- `apps/docs`: VitePress documentation app

## What Problem Raurus Solves

Raurus is trying to solve a common gap in web apps: teams want to replace visual assets like hero images or logos directly inside the UI, without moving the whole site into a CMS.

The V0 workflow is intentionally narrow:

- wrap an image with `EditableAsset`
- enter edit mode with `?edit=true`
- allow edits only when the runtime permission check passes
- upload a replacement image inline
- persist the asset mapping
- refresh the page and keep the updated asset

This keeps content editing focused on the assets that need to change, while the application keeps full control over rendering, storage, permissions, and persistence.

## Links

- Repository: [github.com/RayhanHamada/raurus](https://github.com/RayhanHamada/raurus)
- Docs app: [`apps/docs`](./apps/docs)
- React playground: [`apps/playground-react`](./apps/playground-react)

## What It Is Built With

- TypeScript
- Bun workspaces
- Turbo
- tsdown
- React 19
- Vite
- VitePress
- Vitest
- Ultracite
- SQLite via `better-sqlite3`

## Repository Layout

```text
.
|- apps/
|  |- docs/
|  `- playground-react/
`- packages/
   |- core/
   |- metadata-sqlite/
   |- permissions-basic/
   |- react/
   |- storage-local/
   `- example/
```

## Development

Install dependencies:

```bash
bun install
```

Common commands:

```bash
bun run build
bun run test
bun run typecheck
bun run check
bun run fix
bun run dev:docs
bun run dev:playground
```

## Quick Start

Create a server-side runtime with the provided adapters:

```ts
import { createRaurusRuntime } from "@raurus/core";
import { sqliteMetadataAdapter } from "@raurus/metadata-sqlite";
import { basicPermissions } from "@raurus/permissions-basic";
import { localStorageAdapter } from "@raurus/storage-local";

export const runtime = createRaurusRuntime({
    metadata: sqliteMetadataAdapter({
        dbPath: "./raurus.db",
    }),
    permissions: basicPermissions({
        canEdit({ user }) {
            return Boolean(user);
        },
    }),
    storage: localStorageAdapter({
        publicBaseUrl: "/uploads",
        uploadDir: "./public/uploads",
    }),
});
```

Expose that runtime through your own API layer, then pass a browser-safe runtime bridge into `RaurusProvider`:

```tsx
import type { AssetRecord, RaurusRuntime } from "@raurus/core";
import "@raurus/react/styles.css";
import { EditableAsset, RaurusProvider } from "@raurus/react";

const runtime: RaurusRuntime = {
    async canEdit() {
        const response = await fetch("/api/raurus/permissions");
        const data = (await response.json()) as { canEdit: boolean };
        return data.canEdit;
    },
    async getAsset(id) {
        const response = await fetch(
            `/api/raurus/assets/${encodeURIComponent(id)}`
        );
        return (await response.json()) as AssetRecord | null;
    },
    async removeAsset(id) {
        await fetch(`/api/raurus/assets/${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
    },
    async replaceAsset(id, file) {
        const formData = new FormData();
        formData.set("file", file);

        const response = await fetch(
            `/api/raurus/assets/${encodeURIComponent(id)}`,
            {
                body: formData,
                method: "POST",
            }
        );

        return (await response.json()) as AssetRecord;
    },
};

export const App = () => (
    <RaurusProvider runtime={runtime}>
        <EditableAsset id="homepage.hero.banner">
            {({ asset, edit, isAdmin }) => (
                <button onClick={edit} type="button">
                    <img
                        alt="Hero"
                        src={asset?.url ?? "/hero-default.svg"}
                        style={{ cursor: isAdmin ? "pointer" : "default" }}
                    />
                </button>
            )}
        </EditableAsset>
    </RaurusProvider>
);
```

Run the React playground to see the intended V0 flow end to end:

```bash
bun run dev:playground
```

Then open the app with `?edit=true`, replace an image, and refresh to verify persistence.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make the smallest correct change that fits the current package boundaries.
4. Run `bun run fix`, `bun run check`, `bun run test`, and `bun run typecheck` before opening a pull request.
5. Update docs when behavior or public APIs change.
6. Open a pull request with a clear summary of the problem, solution, and verification.

Repository notes for contributors:

- keep package names under the `@raurus/*` scope
- keep library packages tree-shakeable with explicit exports
- keep framework-specific logic in `@raurus/react` and shared runtime logic in `@raurus/core`
- keep V0 adapters narrow and focused on their current responsibility
- read `AGENTS.md` at the repository root and in the relevant package or app before making substantial changes

## License

This repository is licensed under the MIT License. See [`LICENSE.md`](./LICENSE.md).

## Author

Created and maintained by Muhammad Rayhan Hamada Budiman <rayhanhamada1999@gmail.com>.
