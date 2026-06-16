---
"@raurus/core": major
---

# @raurus/core — major

**Breaking changes**

- `RaurusMetadata` literal-type aliases renamed for clarity: `PhotoMetadata` → `PhotoMetadataType`, `TextMetadata` → `TextMetadataType`, `VideoMetadata` → `VideoMetadataType`. The runtime string values (`"photo" | "text" | "video"`) are unchanged. Update imports accordingly.
- `RaurusAsset` is now `ArrayBuffer` only. The previous `ArrayBuffer | File | Blob` union was removed because `File` and `Blob` are DOM types and forced a DOM lib dependency on the server. Callers that previously passed a `File` or `Blob` should call `.arrayBuffer()` first.
- `RuntimeMetadataAdapter.bulkGetMetadataByPlaceholderIds` is now **required**. Implementations that previously omitted it must add an implementation; the signature is unchanged.
- `RuntimeStorageAdapter` is widened to a four-method menu: `uploadAsset`, `createPresignedUploadUrl`, `createPresignedDownloadUrl`, `deleteAsset`. All four are optional, but implementations declaring a narrower surface must re-check their signatures against the new interface.

**Additive changes**

- `Failure` now carries an optional `code: FailureCode` for machine-readable failure classification. Adapters that do not set it remain valid; consumers should fall back to `UNKNOWN` when the field is absent. The `FailureCode` enum lists `NOT_IMPLEMENTED`, `NOT_FOUND`, `CONFLICT`, `CONFIGURATION`, `CONNECTION`, `PERMISSION`, `RATE_LIMIT`, `UPSTREAM`, `INVALID_INPUT`, `UNKNOWN`.
- `CommonRuntimeAdapter` now declares `apiVersion: "1"`. All existing adapters satisfy this with the literal string `"1"`.
- Factories may carry a phantom `__adapterId` brand on their return value to prevent cross-adapter assignment. The default brand is the open template (`${Lowercase<string>}-metadata-adapter` / `${Lowercase<string>}-storage-adapter`), so existing call sites are unaffected. `RaurusMetadataAdapterId` and `RaurusStorageAdapterId` are exported as the constraint types for the brand.
- `Success<T>`, `Failure`, and `FailureCode` are now exported from the public surface.
