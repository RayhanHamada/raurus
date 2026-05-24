## ADDED Requirements

### Requirement: Provider resolves viewer mode versus editor mode

`@raurus/react` SHALL provide a `RaurusProvider` that makes the runtime available to descendants and enables editor mode only when the current URL includes `?edit=true` and `runtime.canEdit()` resolves `true`.

#### Scenario: Query parameter and permission both allow editing

- **WHEN** the provider initializes in a browser location containing `?edit=true` and runtime permission resolves `true`
- **THEN** descendants receive editor-mode behavior

#### Scenario: Query parameter is missing or permission is denied

- **WHEN** the provider initializes without `?edit=true` or runtime permission resolves `false`
- **THEN** descendants remain in viewer mode and no editing UI is exposed

### Requirement: Editable assets bind runtime state to application rendering

`@raurus/react` SHALL provide an `EditableAsset` component that accepts an asset ID and a render function receiving `asset`, `isAdmin`, `isSelected`, and `edit()`.

#### Scenario: Editable asset renders stored image state

- **WHEN** an `EditableAsset` is rendered for an ID with a persisted asset record
- **THEN** the render function receives that asset record and can use its URL in the application UI

#### Scenario: Editable asset has no stored record

- **WHEN** an `EditableAsset` is rendered for an ID with no persisted asset record
- **THEN** the render function receives `asset` as `null`

### Requirement: Viewer mode does not alter normal application behavior

In viewer mode, `EditableAsset` SHALL render without outlines, overlays, edit controls, toolbar chrome, or other visual editing artifacts.

#### Scenario: Normal user visits the application

- **WHEN** the application renders without editor mode enabled
- **THEN** editable images appear as normal application content with no admin-only affordances

### Requirement: Editor mode provides lightweight selection affordances

In editor mode, editable assets SHALL show a subtle hover affordance and pointer cursor, and invoking `edit()` on an asset SHALL mark that asset as selected.

#### Scenario: Admin hovers an editable asset

- **WHEN** the pointer moves over an editable asset while editor mode is active
- **THEN** the asset shows a subtle outline and pointer cursor

#### Scenario: Admin selects an editable asset

- **WHEN** the admin invokes `edit()` for an editable asset in editor mode
- **THEN** that asset becomes the selected asset in provider state

### Requirement: Editor mode exposes toolbar and inspector controls

In editor mode, the React package SHALL render a minimal floating toolbar and a right-side inspector drawer for the selected asset. The inspector MUST display the asset ID, current image preview, upload replacement action, remove asset action, and close action.

#### Scenario: Asset is selected

- **WHEN** an admin selects an editable asset in editor mode
- **THEN** the inspector drawer opens for that asset and the toolbar remains visible

#### Scenario: Inspector is closed

- **WHEN** the admin activates the inspector close action
- **THEN** the selected asset is cleared and the inspector drawer closes

### Requirement: Upload and removal actions update the rendered asset immediately

The inspector SHALL invoke runtime replacement and removal actions for the selected asset and MUST update the rendered asset state after each successful operation.

#### Scenario: Admin uploads a replacement image

- **WHEN** the admin uploads a valid replacement image from the inspector
- **THEN** the runtime replaces the asset and the updated image URL is reflected in the rendered application without requiring a page reload

#### Scenario: Admin removes the selected asset

- **WHEN** the admin activates remove for the selected asset and the runtime succeeds
- **THEN** the selected asset mapping is removed and the render function receives `asset` as `null`
