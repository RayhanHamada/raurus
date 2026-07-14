import { t } from "elysia";

// oxlint-disable no-template-curly-in-string
import { METADATA_TYPES } from "@/core";
import type { FailureCode } from "@/core";

export const PresignedUrlQuerySchema = t.Object({
    assetKey: t.RegExp(/^(?!\/)(?!.*\/\/)[A-Za-z0-9!_\-.*'()/]+(?:\/[A-Za-z0-9!_\-.*'()/]+)*$/u, {
        examples: ["folder1/file.png", "file.txt", "folder1/folder2/file.jpg"],
    }),
});

export const UploadAssetBodySchema = t.Object({
    files: t.Files({ minItems: 1 }),
});

export const PresignedUrlResponseSchema = t.Object({
    message: t.Literal("OK"),
    data: t.Object({
        url: t.String(),
    }),
});

export const DeleteAssetParamsSchema = t.Object({
    assetKey: t.String({ minLength: 1, examples: ["folder1/file.png"] }),
});

export const DeleteAssetResponseSchema = t.Object({
    message: t.Literal("OK"),
});

export const UploadAssetResponseSchema = t.Object({
    message: t.Literal("OK"),
    data: t.Object({
        assetKey: t.String(),
    }),
});

export const ErrorResponseSchema = t.Object({
    message: t.Literal("Error"),
    error: t.String(),
});

export const MetadataResponseSchema = t.Union([
    t.Object({
        placeholder_id: t.String(),
        type: t.Literal(METADATA_TYPES.PHOTO),
        assetKey: t.String(),
    }),
    t.Object({
        placeholder_id: t.String(),
        type: t.Literal(METADATA_TYPES.TEXT),
        text: t.String(),
    }),
    t.Object({
        placeholder_id: t.String(),
        type: t.Literal(METADATA_TYPES.LINK),
        link: t.String(),
    }),
]);

export const MetadataListResponseSchema = t.Object({
    message: t.Literal("OK"),
    data: t.Array(MetadataResponseSchema),
});

export const MetadataListQuerySchema = t.Object({
    placeholder_ids: t.Optional(t.String()),
});

export const MetadataParamsSchema = t.Object({
    placeholder_id: t.String({ minLength: 1 }),
    pathname: t.String({ minLength: 1 }),
});

export const UpsertMetadataBodySchema = t.Union([
    t.Object({
        type: t.Literal(METADATA_TYPES.PHOTO),
        assetKey: t.String(),
    }),
    t.Object({
        type: t.Literal(METADATA_TYPES.TEXT),
        text: t.String(),
    }),
    t.Object({
        type: t.Literal(METADATA_TYPES.LINK),
        link: t.String(),
    }),
]);

export const AssetContentParamsSchema = t.Object({
    assetKey: t.String({ minLength: 1 }),
});

/**
 * Maps a {@link FailureCode} from `@raurus/core` to an HTTP status. The
 * route layer uses this to translate adapter failures into consistent
 * responses without inspecting the `Error.message` string. The return
 * type is `number` because the mapped status depends on the runtime
 * `code` value; routes set the status dynamically via `set.status`.
 */
export const failureCodeToStatus = (code?: FailureCode) => {
    const DEFAULT_STATUS = 500;
    const statuses = {
        NOT_IMPLEMENTED: 501,
        NOT_FOUND: 404,
        CONFLICT: 409,
        PERMISSION: 401,
        RATE_LIMIT: 429,
        INVALID_INPUT: 400,
        UPSTREAM: 502,
        CONFIGURATION: 500,
        CONNECTION: 503,
        UNKNOWN: 500,
    } as const;

    if (!code) {
        return DEFAULT_STATUS;
    }

    return statuses[code] ?? DEFAULT_STATUS;
};
