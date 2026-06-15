import { t } from "elysia";

export const PresignedUrlQuerySchema = t.Object({
    assetKey: t.String({ minLength: 1 }),
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

export const UploadAssetResponseSchema = t.Object({
    message: t.Literal("OK"),
});

export const ErrorResponseSchema = t.Object({
    message: t.Literal("Error"),
    error: t.String(),
});
