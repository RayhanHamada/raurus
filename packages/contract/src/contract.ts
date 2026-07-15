import { oc } from "@orpc/contract";
import * as v from "valibot";

import { METADATA_TYPES, RESPONSE_MESSAGES } from "./constants";

// ---------------------------------------------------------------------------
// Base contract builder – shared error types available on every procedure
// ---------------------------------------------------------------------------

const baseOc = oc.errors({
    NOT_IMPLEMENTED: {
        data: v.object({
            name: v.string(),
        }),
    },
    CONFLICT: {
        data: v.object({
            name: v.string(),
            detail: v.optional(v.string()),
        }),
    },
});

// ---------------------------------------------------------------------------
// Valibot schemas (mirrors Elysia models from @raurus/server/runtime/models)
// ---------------------------------------------------------------------------

/** Asset key path segment – prevents empty keys, leading slashes, and double slashes. */
const ASSET_KEY_REGEX = /^(?!\/)(?!.*\/\/)[A-Za-z0-9!_\-.*'()/]+(?:\/[A-Za-z0-9!_\-.*'()/]+)*$/u;

const assetKeySchema = v.pipe(v.string(), v.regex(ASSET_KEY_REGEX));

// ---- Discriminated metadata body -----------------------------------------

const photoBodySchema = v.object({
    type: v.literal(METADATA_TYPES.PHOTO),
    assetKey: v.string(),
});

const textBodySchema = v.object({
    type: v.literal(METADATA_TYPES.TEXT),
    text: v.string(),
});

const linkBodySchema = v.object({
    type: v.literal(METADATA_TYPES.LINK),
    text: v.string(),
    link: v.string(),
});

/** Discriminated union keyed on `type` – matches `UpsertMetadataBodySchema`. */
const metadataBodySchema = v.variant("type", [photoBodySchema, textBodySchema, linkBodySchema]);

// ---- Response schemas -----------------------------------------------------

const successResponseSchema = v.object({
    message: v.literal(RESPONSE_MESSAGES.OK),
});

const errorResponseSchema = v.object({
    message: v.literal(RESPONSE_MESSAGES.ERROR),
    error: v.string(),
});

const presignedUrlDataSchema = v.object({
    url: v.string(),
});

const presignedUrlResponseSchema = v.object({
    message: v.literal(RESPONSE_MESSAGES.OK),
    data: presignedUrlDataSchema,
});

// ---- Read (list) response schemas -----------------------------------------

const textMetadataItemSchema = v.object({
    placeholderId: v.string(),
    pathname: v.string(),
    type: v.literal(METADATA_TYPES.TEXT),
    text: v.string(),
});

const linkMetadataItemSchema = v.object({
    placeholderId: v.string(),
    pathname: v.string(),
    type: v.literal(METADATA_TYPES.LINK),
    text: v.string(),
    link: v.string(),
});

const photoMetadataItemSchema = v.object({
    placeholderId: v.string(),
    pathname: v.string(),
    type: v.literal(METADATA_TYPES.PHOTO),
    assetKey: v.string(),
});

const metadataItemSchema = v.variant("type", [textMetadataItemSchema, linkMetadataItemSchema, photoMetadataItemSchema]);

const listMetadataResponseSchema = v.object({
    message: v.literal(RESPONSE_MESSAGES.OK),
    data: v.array(metadataItemSchema),
});

// ---------------------------------------------------------------------------
// Procedure contracts
// ---------------------------------------------------------------------------

// -- PUT /placeholders/:placeholder_id/pathnames/:pathname ------------------

const upsertMetadata = baseOc
    .input(
        v.object({
            placeholder_id: v.string(),
            pathname: v.string(),
            body: metadataBodySchema,
        })
    )
    .output(successResponseSchema);

// -- GET /assets/presigned-upload-url ---------------------------------------

const getPresignedUploadUrl = baseOc
    .input(
        v.object({
            assetKey: assetKeySchema,
        })
    )
    .output(presignedUrlResponseSchema);

// -- DELETE /asset/:asset_key -----------------------------------------------

const deleteAsset = baseOc
    .errors({ NOT_FOUND: {} })
    .input(
        v.object({
            assetKey: v.string(),
        })
    )
    .output(successResponseSchema);

// -- GET /placeholders?pathname=:pathname -----------------------------------

const listMetadataByPathname = baseOc
    .input(
        v.object({
            pathname: v.string(),
        })
    )
    .output(listMetadataResponseSchema);

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/** All procedure contracts, keyed by operation name. */
const contracts = {
    upsertMetadata,
    getPresignedUploadUrl,
    deleteAsset,
    listMetadataByPathname,
} as const;

export { baseOc, contracts, errorResponseSchema, metadataBodySchema };
export type Contracts = typeof contracts;
