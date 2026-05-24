## Context

Raurus V0 needs to prove a narrow product claim: developers can keep control of rendering while admin users replace frontend images directly from the live UI. The repository is currently at the stage where the monorepo shape, package boundaries, runtime API, adapters, React bindings, and demonstration app all need to be defined together.

The main constraints are intentional. V0 only supports React, image assets, local filesystem storage, SQLite metadata, and a simple permission model. The architecture must stay small, avoid premature plugin systems, keep core logic outside React so future framework bindings remain possible without reworking runtime behavior, and scaffold every package under `packages/` with `tsdown`.

## Goals / Non-Goals

**Goals:**

- Define a package layout that cleanly separates framework-agnostic runtime logic from React integration and infrastructure adapters.
- Specify a runtime API that covers the full image replacement lifecycle, including permission checks, validation, persistence, and cleanup on failure.
- Keep adapter implementations minimal and V0-specific while preserving clean package contracts.
- Define an inline editing UX that is invisible in viewer mode and credible in editor mode.
- Provide a playground and docs flow that proves the full install-configure-wrap-edit-refresh loop.

**Non-Goals:**

- Generalized plugin ecosystems, multi-framework abstractions, or extension registries.
- Media support beyond images.
- Cloud storage providers, auth framework integrations, multi-tenancy, drafts, versioning, or publishing workflows.
- SSR- or Next.js-specific APIs.
- Broad admin content management beyond direct inline image replacement.

## Decisions

### Keep `@raurus/core` framework-agnostic

The runtime will own the business flow for `getAsset`, `replaceAsset`, `removeAsset`, and `canEdit`, plus validation and typed errors. React-specific concerns such as provider state, query parameter handling in the browser, selection UI, and inspector rendering stay in `@raurus/react`.

Rationale: this keeps the most important behavior testable without React and prevents UI concerns from leaking into the public runtime contract.

Alternatives considered:

- Put the replacement flow in the React package: rejected because it would make runtime behavior harder to test and tie V0 too tightly to React.
- Expose many granular core primitives instead of a cohesive runtime object: rejected because V0 benefits from a smaller, opinionated surface.

### Use explicit adapter contracts with V0-only responsibilities

Each adapter package will implement a single concrete interface from core: storage persists files, metadata maps asset IDs to stored assets, and permissions answer whether editing is allowed. The initial packages will not introduce a generic plugin registry or dynamic capability negotiation.

Rationale: the product needs one proven path, not an extensibility layer. A narrow contract still leaves room for future packages without over-designing now.

Alternatives considered:

- Merge adapter implementations directly into core: rejected because it would entangle infrastructure concerns and weaken package boundaries.
- Build a richer adapter ecosystem up front: rejected because V0 scope is intentionally narrow.

### Standardize package scaffolding with `tsdown`

Every publishable package under `packages/` will be scaffolded with `tsdown` for build configuration rather than mixing package-specific bundler setups.

Rationale: the repository guidance already requires `tsdown`, and using one package build convention reduces setup variance across the five V0 packages.

Alternatives considered:

- Use `tsup` because it is common in small TypeScript libraries: rejected because it conflicts with the repository-level package scaffolding rule.
- Allow each package to choose its own build tool: rejected because it adds unnecessary inconsistency during V0.

### Model image replacement as upload-then-persist with compensating cleanup

`replaceAsset` will perform permission checks, validate the file, upload it through storage, then persist metadata. If metadata persistence fails after upload, core will attempt to delete the uploaded file before surfacing a typed error.

Rationale: this keeps storage and metadata adapters simple while ensuring partial failures do not leave unnecessary orphaned uploads when cleanup is possible.

Alternatives considered:

- Persist metadata first: rejected because metadata requires the stored asset key and URL produced by upload.
- Ignore cleanup on partial failure: rejected because rollback behavior is a stated V0 requirement.

### Gate editor mode with both URL intent and permission resolution

`@raurus/react` will enable editor mode only when `?edit=true` is present and `runtime.canEdit()` resolves true. Without both conditions, components render in viewer mode with no overlays or admin controls.

Rationale: the query parameter provides explicit operator intent, while the permission check prevents accidental exposure of editing affordances.

Alternatives considered:

- Auto-enable edit mode whenever permissions allow: rejected because it risks leaking admin UI into normal browsing.
- Base edit mode only on a client-side toggle: rejected because V0 explicitly requires query-parameter entry.

### Keep admin UI minimal and colocated in the React package

The V0 admin experience will consist of subtle hover affordances, a floating toolbar, selected-asset state, and an inspector drawer with preview, upload, remove, and close actions. The package will expose these through the default `EditableAsset` and provider experience instead of requiring a separate admin shell.

Rationale: the product needs a believable, low-friction editing flow that works immediately in the playground and in initial adopters.

Alternatives considered:

- Ship only hooks and require consumers to build all admin UI: rejected because V0 success depends on demonstrating a polished editing loop.
- Build a much richer admin console: rejected because it exceeds the V0 scope.

### Use the playground as the primary integration proof

The React playground will be treated as both a demo and an integration harness. It will include at least a hero image and logo, wire up the concrete V0 adapters, and prove persistence after refresh.

Rationale: the fastest way to validate developer experience is a working app that uses the public APIs exactly as adopters would.

Alternatives considered:

- Rely only on unit tests: rejected because tests alone do not prove the end-to-end ergonomics.
- Delay the playground until after core and React are complete: rejected because the playground should drive API clarity while implementation is still flexible.

## Risks / Trade-offs

- [Browser `File` versus server-side storage boundaries] -> Mitigation: define the runtime around the standard `File` upload object for V0 and keep adapters focused on the environments exercised by the playground and tests.
- [Local filesystem URLs may vary by app setup] -> Mitigation: require explicit `uploadDir` and `publicBaseUrl` configuration in `@raurus/storage-local` and document the expected static file serving assumptions.
- [Edit-mode gating requires asynchronous permission resolution] -> Mitigation: define a clear loading-to-viewer/editor transition in the React package and ensure viewer mode never flashes editing UI before permission success.
- [Rollback cleanup can fail independently] -> Mitigation: treat cleanup as best effort, preserve the original persistence error as primary, and cover cleanup behavior in tests.
- [Combining runtime, adapters, UI, and playground in one change increases scope] -> Mitigation: keep package APIs intentionally small and follow the required implementation order to preserve focus.

## Migration Plan

This is an initial introduction rather than a migration of existing runtime behavior. Implementation should land in the required order: workspace scaffolding, core runtime contracts, adapter packages, React package, admin UI, playground, tests, and docs.

If a partial rollout is needed during development, packages can remain unpublished until the playground proves the full flow. Rollback is straightforward because the change only adds new packages, apps, and docs; reverting the added workspace entries removes the feature set.

## Open Questions

- Whether `apps/docs` should be a full documentation app in V0 or a lighter placeholder with focused getting-started content.
- Whether the React package should expose upload/remove state in the render context during V0 or keep the render API minimal and let the inspector own that state.
- Which SQLite client library best matches Bun workspace ergonomics while keeping the adapter simple.
