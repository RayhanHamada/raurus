# Raurus Monorepo

## Project Context

Raurus is a TypeScript monorepo building a modular, contract-first web application framework. The project is managed with Bun workspaces and Turborepo.

## Workspace Structure

```
raurus/
├── apps/
├── packages/
│   ├── core/                # @raurus/core — shared framework types and adapter interfaces
│   ├── server/              # @raurus/server — Hono + itty-spec runtime with generated OpenAPI export
│   └── tsconfig/            # @raurus/tsconfig — shared TypeScript base configuration
├── turbo.json               # Turborepo pipeline config
└── package.json             # Root workspace config (bun@1.3.14)
```

## Tooling

| Tool                | Purpose                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| **turbo**           | Monorepo orchestration — `build`, `test`, `typecheck`, `dev` pipelines |
| **tsdown**          | Rolldown-based build tool for bundling packages (tsup successor)       |
| **oxlint**          | Rust-based linter, configured via `ultracite` presets                  |
| **oxfmt**           | Rust-based formatter, configured via `ultracite`                       |
| **vitest**          | Unit testing framework                                                 |
| **TypeScript 6**    | Type checking with `@tsconfig/strictest` as baseline                   |
| **@changesets/cli** | Versioning and changelog management                                    |

## Standards

- Use Bun as the package manager — all scripts use `bun run`, not `npm`, `yarn`, or `pnpm`
- All packages output build artifacts to `dist/`
- Formatting and linting are handled by oxfmt and oxlint via ultracite presets — do not introduce alternative linters or formatters
- Extend `@raurus/tsconfig` in every package's `tsconfig.json`
- Use `tsdown` for building packages, not tsup, rollup, or esbuild directly
- Every package-level AGENTS.md references this root AGENTS.md
- **When a task touches one or more packages, update the relevant `packages/<name>/AGENTS.md`** to reflect any new conventions, patterns, dependencies, or architectural decisions introduced by the change
- **At the end of every task, verify `AGENTS.md` files are current** — check that root and any affected package-level AGENTS.md files accurately reflect the current codebase. If stale, update them before considering the task complete

## Workflow

- Run `bun run build` at the root to build all packages
- Run `bun run test` at the root to test all packages
- Run `bun run typecheck` at the root to type-check all packages
- Use `bun run check` for full linting and `bun run fix` for auto-fixes
- Use Changesets (`bun changeset add`) before committing feature or breaking changes

## Conventions

- Package names follow the `@raurus/<name>` pattern
- Packages use ESM (`"type": "module"`) exclusively
- Each package documents its own conventions in `packages/<name>/AGENTS.md`
- Ignored paths for linting and formatting are defined in `oxignore.json`
- Agent skills are locked via `skills-lock.json` and stored in `.agents/skills/`
