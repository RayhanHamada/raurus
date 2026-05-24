## Why

Raurus needs a concrete V0 that proves inline asset editing can feel simple for developers and invisible to normal users. The immediate need is a narrow, shippable runtime that validates the product primitive end to end before broader framework, media, or infrastructure support is considered.

## What Changes

- Add a Bun workspace monorepo structure for Raurus with apps for a React playground and documentation.
- Introduce `@raurus/core` as a framework-agnostic runtime that owns asset retrieval, image validation, permission checks, replacement flow, removal flow, and rollback on persistence failures.
- Introduce minimal V0 adapters for local file storage, SQLite metadata persistence, and basic permission checks.
- Introduce `@raurus/react` as a thin React integration layer with `RaurusProvider`, `EditableAsset`, edit-mode state, selection state, and minimal admin UI primitives.
- Add inline editing UX for images only, including viewer mode behavior, editor mode behavior, selection handling, and an inspector drawer for replacement and removal.
- Add a playground React app that demonstrates configuring the runtime, wrapping editable images, persisting replacements, and verifying updates after refresh.
- Add tests covering runtime lifecycle behavior, validation, rollback, React editing flows, and viewer-mode non-interference.
- Add documentation for installation, configuration, and the V0 usage flow.

## Capabilities

### New Capabilities

- `runtime-core`: Framework-agnostic runtime behavior for editable asset retrieval, validation, permissions, replacement, removal, and typed error handling.
- `adapter-packages`: V0 adapter behavior for local file storage, SQLite metadata persistence, and basic permission evaluation.
- `react-inline-editing`: React provider, editable asset bindings, edit mode gating, asset selection, and inline image editing UI.
- `playground-and-docs`: Demonstration application and setup documentation that prove the end-to-end developer workflow.

### Modified Capabilities

None.

## Impact

- Adds new workspace apps under `apps/playground-react` and `apps/docs`.
- Adds new packages under `packages/core`, `packages/react`, `packages/storage-local`, `packages/metadata-sqlite`, and `packages/permissions-basic`.
- Defines the initial public APIs for `createRaurusRuntime`, adapter factories, `RaurusProvider`, and `EditableAsset`.
- Introduces Bun, TypeScript, `tsdown`, Vitest, ESLint, and Prettier-based workspace tooling for the monorepo, with every package under `packages/` scaffolded using `tsdown`.
- Establishes the V0 behavioral contract that later implementation and documentation will follow.
