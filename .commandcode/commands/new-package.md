---
description: Scaffold a new workspace package under packages/ matching the existing @raurus conventions
---

Scaffold a new workspace package under `packages/` that matches the conventions of the existing `@raurus/*` packages.

**Input**: The argument after `/new-package` is the folder name used for the new package directory under `packages/`. The same value is used as the npm package name segment, so the package is published as `@raurus/<folder-name>`.

    For example: `/new-package storage-cache` creates `packages/storage-cache/` published as `@raurus/storage-cache`.

    If the argument is missing, ask for the folder name before proceeding. If `packages/<name>` already exists, stop and ask whether to overwrite, extend, or abort.

**Steps**

1. **Verify the folder/package name**

    - The argument is the folder name (e.g. `storage-cache`) and is also the npm package name segment.
    - The directory will be `packages/<name>/`.
    - The published name will be `@raurus/<name>`.
    - Reject names that conflict with existing folders under `packages/`, contain uppercase letters, or are not valid npm package name segments (kebab-case, no leading dot/underscore).

2. **Read the existing conventions to mirror**

    Re-read the current state of at least one existing package to avoid drift:
    - `packages/core/package.json`
    - `packages/core/tsconfig.json`
    - `packages/core/tsdown.config.ts`
    - `packages/core/AGENTS.md` (if present)
    - Root `package.json`, `turbo.json`, and `oxignore.json` for monorepo-level settings
    - A second package (e.g. `packages/logger/` or `packages/server/`) to cross-check conventions for packages that ship runtime deps

    Use the live values for dev dependency versions — do not hardcode versions from memory.

3. **Create the package directory structure**

    Create `packages/<name>/` with:

    - `src/index.ts` — minimal barrel export (see template below)
    - `package.json` — see template below
    - `tsconfig.json` — extends `@raurus/tsconfig`
    - `tsdown.config.ts` — `tsdown` build with `dts` and `exports` enabled
    - `AGENTS.md` — short package-level guidance, references the root `AGENTS.md`

4. **Write `package.json`**

    Use the exact shape of the existing packages. Fill in:

    - `name`: `@raurus/<name>`
    - `version`: `0.0.0`
    - `description`: a one-line description (ask the user if not obvious from the input)
    - `type`: `module`
    - `files`: `["dist"]`
    - `exports`: include `.` → `./dist/index.js` and `./package.json` → `./package.json` (mirror `packages/core/package.json` exactly)
    - `scripts`: `build` → `tsdown`, `dev` → `tsdown --watch`, `typecheck` → `tsc --noEmit`, `release` → `bumpp`
    - `devDependencies`: `@raurus/tsconfig` (`workspace:*`), `@types/node`, `bumpp`, `tsdown`, `typescript`, `vitest` — pin versions to the values used by `packages/core/package.json`

    Leave `dependencies` empty unless the user specifies runtime deps. If runtime deps are needed, add them with the user's confirmation and use `workspace:*` for any other `@raurus/*` packages.

5. **Write `tsconfig.json`**

    Mirror `packages/core/tsconfig.json`:

    ```json
    {
        "extends": ["@raurus/tsconfig"],
        "compilerOptions": {
            "target": "esnext",
            "lib": ["ES2023"],
            "types": ["node"],
            "paths": {
                "@/*": ["./src/*"]
            }
        },
        "include": ["src"]
    }
    ```

    Only add `"DOM"` to `lib` if the package genuinely needs DOM types (logger and server do, core deliberately does not). Default to `["ES2023"]` and ask before adding DOM.

6. **Write `tsdown.config.ts`**

    Mirror `packages/core/tsdown.config.ts`:

    ```ts
    import { defineConfig } from "tsdown";

    export default defineConfig({
        dts: true,
        exports: true,
        entry: ["src/index.ts"],
        platform: "neutral",
    });
    ```

    If the package will ship adapters (a la `packages/server/src/adapters/`), expand to the array form with `entry: ["src/index.ts", "src/adapters/*/index.ts"]` and add a matching `./adapters/<id>` entry to `exports`. Confirm with the user before assuming adapter shape.

7. **Write `src/index.ts`**

    Minimal barrel. If the package has no source yet, export a placeholder constant so the barrel compiles:

    ```ts
    export const PACKAGE_NAME = "@raurus/<name>";
    ```

    Ask the user what the first real export should be before writing any real module — do not invent APIs.

8. **Write `AGENTS.md`**

    Keep it short and durable. Include:

    - A one-line description of the package's role
    - "This file extends the root `AGENTS.md`" with a relative link (`../AGENTS.md`)
    - A **Conventions** section noting any package-specific deviations (DOM lib, adapter layout, etc.)
    - A **Workflow** section pointing at the root-level `bun run build`, `bun run typecheck`, `bun run test`, `bun run check`, `bun run fix`

    Do not restate monorepo-wide conventions that already live in the root `AGENTS.md`.

9. **Install workspace links**

    From the repo root run:

    ```bash
    bun install
    ```

    This makes the new package resolvable as `@raurus/<name>` for other workspace packages and registers it in the root lockfile. Skip if the user has already installed or wants to do it themselves.

10. **Verify the scaffold**

    Run from the package directory:

    ```bash
    bun run typecheck
    bun run build
    ```

    Both must succeed. If they fail, fix the scaffold before reporting completion. Also run `bun run check` from the repo root to confirm lint/format pass for the new files.

11. **Report what was created**

    Summarize the created files and the next steps the user might want to take (add a real source module, wire it into another package, add a changeset, etc.).

**Output**

```md
Scaffolded `packages/<name>/` (`@raurus/<name>`):

- `package.json` — scripts, dev deps, exports
- `tsconfig.json` — extends `@raurus/tsconfig`
- `tsdown.config.ts` — dts + exports build
- `src/index.ts` — barrel
- `AGENTS.md` — package-level guidance

Verified with `bun run typecheck` and `bun run build`. Suggested next step: add the first real module in `src/` and update `src/index.ts` to re-export it.
```

**Guardrails**

- Mirror the live conventions of existing packages — do not invent new patterns
- Re-read source files instead of relying on memory for version numbers and exact fields
- Keep `tsconfig.json` minimal; do not add flags the existing packages do not use
- Do not add `dependencies` the user has not confirmed
- Do not introduce alternative linters, formatters, or build tools
- Do not edit `AGENTS.md` files outside the new package unless the scaffold genuinely changes a monorepo-wide rule (and confirm with the user first)
- If the user has not described the package's purpose, ask before writing speculative source code in `src/index.ts`
