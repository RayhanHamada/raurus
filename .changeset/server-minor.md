---
"@raurus/server": minor
---

# @raurus/server — minor

- Reference adapters (`example-metadata-adapter`, `example-storage-adapter`, `s3mini-storage-adapter`) updated to declare `apiVersion: "1"` and to participate in the widened storage menu.
- `example-metadata-adapter.bulkGetMetadataByPlaceholderIds` is now part of the required contract (it was already implemented; the optional `?` is gone from the inferred type).
- `example-storage-adapter` and `s3mini-storage-adapter` implement the full four-method storage menu: `uploadAsset` (memory only), `createPresignedUploadUrl`, `createPresignedDownloadUrl`, `deleteAsset`. The s3mini adapter maps failures to `FailureCode` values (`CONNECTION`, `UPSTREAM`, `NOT_FOUND`) so the server can return appropriate HTTP statuses.
- New routes: `GET /presigned-download-url` and `DELETE /asset/:assetKey`. New schemas in `models.ts`: `DeleteAssetParamsSchema` and `DeleteAssetResponseSchema`.
- `models.ts` exports a new `failureCodeToStatus(code?: FailureCode): number` helper that the route layer uses to translate `@raurus/core` `FailureCode` values into HTTP statuses (`NOT_FOUND` → 404, `CONFLICT` → 409, `PERMISSION` → 401, `RATE_LIMIT` → 429, `INVALID_INPUT` → 400, `NOT_IMPLEMENTED` → 501, others → 500).
- Routes that hit a storage method the adapter does not implement now return `501 Not Implemented` (via a new `notImplemented(status, methodName)` helper in `routes.ts`) instead of `400 Bad Request`.
- The pre-existing `POST /upload-asset` route's summary was clarified to "Get Presigned Upload URL" for the upload-URL endpoint; the upload-asset body schema and route remain unchanged.
