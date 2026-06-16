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

export const UploadAssetResponseSchema = t.Object({
    message: t.Literal("OK"),
});

export const ErrorResponseSchema = t.Object({
    message: t.Literal("Error"),
    error: t.String(),
});
