## ADDED Requirements

### Requirement: Local storage adapter persists image files to the filesystem

`@raurus/storage-local` SHALL provide a factory that stores uploaded image files in a configured local directory, preserves file extensions, generates unique file names, and returns the stored asset key, URL, MIME type, and size.

#### Scenario: Image upload is stored successfully

- **WHEN** the local storage adapter uploads a supported image file with configured `uploadDir` and `publicBaseUrl`
- **THEN** it writes the file into the configured directory and returns a stored asset descriptor with a unique key and public URL

#### Scenario: Uploaded file has a filename extension

- **WHEN** the local storage adapter uploads an image file named `hero.webp`
- **THEN** the stored key preserves the `.webp` extension while still using a unique generated filename

### Requirement: Local storage adapter removes stored assets by key

`@raurus/storage-local` SHALL delete a previously stored file when asked to remove its storage key.

#### Scenario: Stored file is deleted

- **WHEN** the local storage adapter receives a delete request for an existing key
- **THEN** it removes the corresponding file from the configured upload directory

### Requirement: SQLite metadata adapter persists editable asset records

`@raurus/metadata-sqlite` SHALL provide a factory that stores editable asset mappings in a SQLite database using the `editable_assets` table with `id`, `asset_key`, `url`, `mime_type`, and `updated_at` fields.

#### Scenario: Asset record is written

- **WHEN** the SQLite metadata adapter sets a record for `homepage.hero.banner`
- **THEN** the database contains a row whose values match the provided record fields

#### Scenario: Asset record is read

- **WHEN** the SQLite metadata adapter gets a record for an ID that exists in the database
- **THEN** it returns the corresponding asset record

### Requirement: SQLite metadata adapter removes mappings

`@raurus/metadata-sqlite` SHALL delete editable asset mappings by ID.

#### Scenario: Mapping is removed

- **WHEN** the SQLite metadata adapter removes an existing editable asset ID
- **THEN** subsequent reads for that ID return `null`

### Requirement: Basic permissions adapter delegates to configured logic

`@raurus/permissions-basic` SHALL provide a factory that accepts a `canEdit` function and resolves edit permission by delegating to that function with the provided permission context.

#### Scenario: Permission callback grants access

- **WHEN** the basic permissions adapter is configured with a `canEdit` callback that returns `true`
- **THEN** the adapter resolves `true` for permission checks

#### Scenario: Permission callback denies access

- **WHEN** the basic permissions adapter is configured with a `canEdit` callback that returns `false`
- **THEN** the adapter resolves `false` for permission checks
