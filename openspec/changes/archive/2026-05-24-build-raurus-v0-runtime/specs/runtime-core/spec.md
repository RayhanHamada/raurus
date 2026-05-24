## ADDED Requirements

### Requirement: Runtime factory composes V0 adapters

The system SHALL provide a `createRaurusRuntime` factory that accepts storage, metadata, and permissions adapters and returns a runtime object with `getAsset`, `replaceAsset`, `removeAsset`, and `canEdit` methods.

#### Scenario: Runtime is created with required adapters

- **WHEN** a developer passes valid storage, metadata, and permissions adapters to `createRaurusRuntime`
- **THEN** the returned runtime exposes the V0 asset lifecycle methods using those adapter implementations

### Requirement: Runtime retrieves editable asset metadata

The runtime SHALL resolve asset state by editable asset ID through the metadata adapter and return either the stored asset record or `null` when no asset is mapped.

#### Scenario: Asset record exists

- **WHEN** `runtime.getAsset("homepage.hero.banner")` is called and metadata contains a matching record
- **THEN** the runtime returns that asset record without modifying it

#### Scenario: Asset record is missing

- **WHEN** `runtime.getAsset("homepage.hero.banner")` is called and metadata has no matching record
- **THEN** the runtime returns `null`

### Requirement: Runtime gates mutations on edit permission

The runtime SHALL check the permission adapter before replacing or removing an asset and MUST reject unauthorized mutation attempts with a typed permission error.

#### Scenario: Replacement is denied

- **WHEN** `runtime.replaceAsset` is called and `permissions.canEdit()` resolves `false`
- **THEN** the runtime rejects the operation with a typed permission error and does not call storage or metadata adapters

#### Scenario: Removal is denied

- **WHEN** `runtime.removeAsset` is called and `permissions.canEdit()` resolves `false`
- **THEN** the runtime rejects the operation with a typed permission error and does not mutate metadata or storage

### Requirement: Runtime validates uploaded files before persistence

The runtime SHALL accept image uploads only for `image/png`, `image/jpeg`, `image/webp`, and `image/gif`, and MUST reject files larger than the configured limit or 10 MB by default with typed validation errors.

#### Scenario: MIME type is not supported

- **WHEN** `runtime.replaceAsset` is called with a file whose MIME type is not one of the allowed image types
- **THEN** the runtime rejects with a typed invalid-MIME error before calling the storage adapter

#### Scenario: File is too large

- **WHEN** `runtime.replaceAsset` is called with a file larger than the configured max size
- **THEN** the runtime rejects with a typed file-size error before calling the storage adapter

### Requirement: Runtime replaces assets with compensating cleanup

The runtime SHALL replace an asset by validating the file, uploading it through storage, persisting the resulting metadata record, and returning the updated record. If metadata persistence fails after upload, the runtime MUST attempt to delete the uploaded file before returning a typed persistence failure.

#### Scenario: Replacement succeeds

- **WHEN** `runtime.replaceAsset("homepage.hero.banner", file)` is called with permission granted and all adapters succeed
- **THEN** the runtime uploads the file, persists the metadata mapping, and returns the updated asset record

#### Scenario: Metadata persistence fails after upload

- **WHEN** `runtime.replaceAsset("homepage.hero.banner", file)` uploads successfully but metadata persistence throws an error
- **THEN** the runtime attempts to delete the uploaded asset key and rejects with a typed metadata persistence error

### Requirement: Runtime removes persisted assets

The runtime SHALL remove an editable asset by deleting its metadata mapping and, when an asset record exists, deleting the referenced stored asset key through the storage adapter.

#### Scenario: Existing asset is removed

- **WHEN** `runtime.removeAsset("homepage.hero.banner")` is called for an ID with a stored record and permission granted
- **THEN** the runtime removes the metadata record and deletes the stored asset key

#### Scenario: Missing asset is removed

- **WHEN** `runtime.removeAsset("homepage.hero.banner")` is called for an ID with no stored record and permission granted
- **THEN** the runtime responds with a typed missing-asset error without calling storage deletion

### Requirement: Runtime exposes permission evaluation

The runtime SHALL provide `canEdit()` so React and other integrations can resolve whether the current context is allowed to edit assets.

#### Scenario: Permission is allowed

- **WHEN** `runtime.canEdit()` is called and the permission adapter resolves `true`
- **THEN** the runtime resolves `true`

#### Scenario: Permission is denied

- **WHEN** `runtime.canEdit()` is called and the permission adapter resolves `false`
- **THEN** the runtime resolves `false`
