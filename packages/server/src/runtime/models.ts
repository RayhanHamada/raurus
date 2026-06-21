import type { FailureCode } from "@raurus/core";
import { t } from "elysia";

export const HealthCheckResponseSchema = t.Object({
    status: t.Union([t.Literal("OK"), t.Literal("Error")]),
    message: t.Literal("RAURUS_ENDPOINT"),
});

export const PresignedUrlQuerySchema = t.Object({
    assetKey: t.RegExp(/^(?!\/)(?!.*\/\/)[A-Za-z0-9!_\-.*'()/]+(?:\/[A-Za-z0-9!_\-.*'()/]+)*$/u, {
        examples: ["folder1/file.png", "file.txt", "folder1/folder2/file.jpg"],
    }),
    expiresIn: t.Optional(t.Number({ minimum: 60, examples: [3600] })),
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

export const LoginBodySchema = t.Object({
    password: t.String({ minLength: 1 }),
});

export const LoginResponseSchema = t.Object({
    message: t.Literal("OK"),
    data: t.Object({
        token: t.String(),
    }),
});

export const VerifySessionResponseSchema = t.Object({
    message: t.Literal("OK"),
    data: t.Object({
        valid: t.Literal(true),
    }),
});

export const MetadataResponseSchema = t.Union([
    t.Object({
        placeholderId: t.String(),
        type: t.Literal("photo"),
        assetKey: t.String(),
    }),
    t.Object({
        placeholderId: t.String(),
        type: t.Literal("text"),
        text: t.String(),
    }),
    t.Object({
        placeholderId: t.String(),
        type: t.Literal("video"),
        assetKey: t.String(),
    }),
]);

export const MetadataListResponseSchema = t.Object({
    message: t.Literal("OK"),
    data: t.Array(MetadataResponseSchema),
});

export const MetadataListQuerySchema = t.Object({
    placeholderIds: t.Optional(t.String()),
});

export const MetadataParamsSchema = t.Object({
    placeholderId: t.String({ minLength: 1 }),
});

export const UpsertMetadataBodySchema = t.Union([
    t.Object({
        type: t.Union([t.Literal("photo"), t.Literal("video")]),
        assetKey: t.String(),
    }),
    t.Object({
        type: t.Literal("text"),
        text: t.String(),
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
export const failureCodeToStatus = (code?: FailureCode): number => {
    switch (code) {
        case "NOT_IMPLEMENTED": {
            return 501;
        }
        case "NOT_FOUND": {
            return 404;
        }
        case "CONFLICT": {
            return 409;
        }
        case "PERMISSION": {
            return 401;
        }
        case "RATE_LIMIT": {
            return 429;
        }
        case "INVALID_INPUT": {
            return 400;
        }
        default: {
            return 500;
        }
    }
};
