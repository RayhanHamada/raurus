## 1. Workspace Setup

- [x] 1.1 Create the root Bun workspace configuration for `apps/*` and `packages/*`.
- [x] 1.2 Create the directory structure for `apps/playground-react`, `apps/docs`, and the five V0 packages.
- [x] 1.3 Scaffold `packages/core` with `tsdown` and the `@raurus/core` package name.
- [x] 1.4 Scaffold `packages/react` with `tsdown` and the `@raurus/react` package name.
- [x] 1.5 Scaffold `packages/storage-local` with `tsdown` and the `@raurus/storage-local` package name.
- [x] 1.6 Scaffold `packages/metadata-sqlite` with `tsdown` and the `@raurus/metadata-sqlite` package name.
- [x] 1.7 Scaffold `packages/permissions-basic` with `tsdown` and the `@raurus/permissions-basic` package name.
- [x] 1.8 Add shared TypeScript configuration for the workspace and package builds.
- [x] 1.9 Add shared lint, format, and test scripts for Bun, ESLint, Prettier, and Vitest.
- [x] 1.10 Add package-level `AGENTS.md` files where package-specific guidance is introduced by the implementation.

## 2. Core Types And Errors

- [x] 2.1 Define the `StoredAsset` type in `@raurus/core`.
- [x] 2.2 Define the `AssetRecord` type in `@raurus/core`.
- [x] 2.3 Define the `StorageAdapter` interface in `@raurus/core`.
- [x] 2.4 Define the `MetadataAdapter` interface in `@raurus/core`.
- [x] 2.5 Define the `PermissionContext` type and `PermissionAdapter` interface in `@raurus/core`.
- [x] 2.6 Define runtime configuration types, including validation options.
- [x] 2.7 Add typed errors for invalid MIME type, oversized file, permission denied, metadata persistence failure, upload failure, and missing asset.
- [x] 2.8 Export the public core API surface explicitly from `@raurus/core`.

## 3. Core Runtime Behavior

- [x] 3.1 Implement `createRaurusRuntime` to capture configured adapters and validation settings.
- [x] 3.2 Implement `runtime.getAsset(id)` using the metadata adapter.
- [x] 3.3 Implement `runtime.canEdit(ctx?)` using the permission adapter.
- [x] 3.4 Implement allowed-image MIME type validation for PNG, JPEG, WebP, and GIF.
- [x] 3.5 Implement file-size validation with the default 10 MB limit.
- [x] 3.6 Implement the successful `runtime.replaceAsset(id, file)` flow.
- [x] 3.7 Implement rollback cleanup when upload succeeds and metadata persistence fails.
- [x] 3.8 Implement the successful `runtime.removeAsset(id)` flow.
- [x] 3.9 Implement missing-asset handling for `runtime.removeAsset(id)`.

## 4. Storage Adapter Package

- [x] 4.1 Add the `@raurus/storage-local` package dependencies and package exports.
- [x] 4.2 Implement adapter configuration for `uploadDir` and `publicBaseUrl`.
- [x] 4.3 Implement unique filename generation for uploaded files.
- [x] 4.4 Implement extension preservation for uploaded image files.
- [x] 4.5 Implement file write behavior for `upload(file)`.
- [x] 4.6 Implement public URL generation for uploaded files.
- [x] 4.7 Implement delete-by-key behavior for stored files.
- [x] 4.8 Export the local storage adapter factory explicitly.

## 5. Metadata Adapter Package

- [x] 5.1 Add the `@raurus/metadata-sqlite` package dependencies and package exports.
- [x] 5.2 Implement adapter configuration for the SQLite database path.
- [x] 5.3 Implement database initialization for the `editable_assets` table.
- [x] 5.4 Implement `get(id)` for stored asset records.
- [x] 5.5 Implement `set(id, record)` for stored asset records.
- [x] 5.6 Implement `remove(id)` for stored asset records.
- [x] 5.7 Export the SQLite metadata adapter factory explicitly.

## 6. Permissions Adapter Package

- [x] 6.1 Add the `@raurus/permissions-basic` package dependencies and package exports.
- [x] 6.2 Implement configuration typing for the user-supplied `canEdit` callback.
- [x] 6.3 Implement adapter delegation to the configured `canEdit` callback.
- [x] 6.4 Export the basic permissions adapter factory explicitly.

## 7. React Provider And State

- [x] 7.1 Add the `@raurus/react` package dependencies and package exports.
- [x] 7.2 Implement runtime context wiring for React consumers.
- [x] 7.3 Implement provider logic that reads `?edit=true` from the browser location.
- [x] 7.4 Implement async permission resolution for edit-mode eligibility.
- [x] 7.5 Implement viewer versus editor mode state handling without flashing admin UI in viewer mode.
- [x] 7.6 Implement selected asset state in the provider.
- [x] 7.7 Export the provider and supporting hooks explicitly.

## 8. Editable Asset And Admin UI

- [x] 8.1 Implement `EditableAsset` asset loading by ID.
- [x] 8.2 Implement the `EditableRenderContext` contract with `asset`, `isAdmin`, `isSelected`, and `edit()`.
- [x] 8.3 Implement viewer-mode rendering with no overlays or editing controls.
- [x] 8.4 Implement editor-mode hover affordances with a subtle outline and pointer cursor.
- [x] 8.5 Implement asset selection through `edit()`.
- [x] 8.6 Implement the floating toolbar with `Editing Mode` and `Exit` actions.
- [x] 8.7 Implement the inspector drawer shell and selected asset display.
- [x] 8.8 Implement current image preview rendering in the inspector.
- [x] 8.9 Implement replacement upload handling from the inspector.
- [x] 8.10 Implement asset removal handling from the inspector.
- [x] 8.11 Implement inspector close behavior that clears selection.
- [x] 8.12 Ensure successful replace and remove actions refresh rendered asset state immediately.

## 9. Playground Application

- [x] 9.1 Create the `apps/playground-react` app scaffold and workspace wiring.
- [x] 9.2 Configure the playground to create a runtime with the local storage, SQLite metadata, and basic permissions adapters.
- [x] 9.3 Add an editable hero image example using `EditableAsset`.
- [x] 9.4 Add an editable logo example using `EditableAsset`.
- [x] 9.5 Add visible playground instructions for entering edit mode.
- [x] 9.6 Verify replacement uploads update the rendered asset immediately in the playground.
- [x] 9.7 Verify refreshed playground state reflects persisted metadata and uploaded files.

## 10. Documentation

- [x] 10.1 Create the initial `apps/docs` surface or chosen docs entrypoint.
- [x] 10.2 Document package installation for the V0 packages.
- [x] 10.3 Document runtime creation and adapter configuration.
- [x] 10.4 Document `RaurusProvider` and `EditableAsset` usage with a minimal example.
- [x] 10.5 Document the `?edit=true` entry flow and expected admin behavior.
- [x] 10.6 Document persistence expectations, local storage assumptions, and V0 limitations.

## 11. Automated Tests

- [x] 11.1 Add core tests for `getAsset` returning an existing record.
- [x] 11.2 Add core tests for `getAsset` returning `null` when a record is missing.
- [x] 11.3 Add core tests for `canEdit()` resolving true and false.
- [x] 11.4 Add core tests for invalid MIME type validation.
- [x] 11.5 Add core tests for oversized file validation.
- [x] 11.6 Add core tests for successful replacement uploads and metadata persistence.
- [x] 11.7 Add core tests for rollback cleanup after metadata persistence failure.
- [x] 11.8 Add core tests for successful asset removal.
- [x] 11.9 Add core tests for missing-asset removal errors.
- [x] 11.10 Add storage adapter tests for file write, URL generation, and delete-by-key behavior.
- [x] 11.11 Add SQLite metadata adapter tests for table initialization and get, set, remove behavior.
- [x] 11.12 Add permissions adapter tests for callback delegation.
- [x] 11.13 Add React tests for viewer mode with no editing artifacts.
- [x] 11.14 Add React tests for editor mode enablement from query parameter plus permission success.
- [x] 11.15 Add React tests for asset selection and inspector visibility.
- [x] 11.16 Add React tests for upload interactions updating rendered asset state.
- [x] 11.17 Add React tests for remove interactions clearing rendered asset state.

## 12. Verification

- [x] 12.1 Run the targeted package test suites during implementation and fix failures.
- [x] 12.2 Run the full repository test suite after the V0 flow is complete.
- [x] 12.3 Run the required lint and format checks and fix resulting issues.
- [x] 12.4 Confirm the playground supports the install-configure-wrap-edit-refresh success criteria.
