import { Elysia, t } from "elysia";

const PresignedUrlQuery = t.Object({
    assetKey: t.String({ minLength: 1 }),
});

const UploadAssetBody = t.Object({
    file: t.File(),
});

const PresignedUrlResponse = t.Object({
    message: t.String(),
    data: t.Object({
        url: t.String(),
    }),
});

const UploadAssetResponse = t.Object({
    message: t.String(),
});

const ErrorResponse = t.Object({
    message: t.String(),
    error: t.String(),
});

export const models = new Elysia({ name: "raurus.models" }).model({
    PresignedUrlQuery,
    UploadAssetBody,
    PresignedUrlResponse,
    UploadAssetResponse,
    ErrorResponse,
});
