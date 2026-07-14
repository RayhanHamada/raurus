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

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/** All procedure contracts, keyed by operation name. */
const contracts = {
    upsertMetadata,
    getPresignedUploadUrl,
    deleteAsset,
} as const;

export { baseOc, contracts, errorResponseSchema, metadataBodySchema };
export type Contracts = typeof contracts;
