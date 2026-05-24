export type RaurusErrorCode =
    | "INVALID_MIME_TYPE"
    | "FILE_TOO_LARGE"
    | "PERMISSION_DENIED"
    | "UPLOAD_FAILED"
    | "METADATA_PERSISTENCE_FAILED"
    | "MISSING_ASSET";

export class RaurusRuntimeError extends Error {
    public readonly code: RaurusErrorCode;

    public override readonly cause: unknown;

    public constructor(
        code: RaurusErrorCode,
        message: string,
        cause?: unknown
    ) {
        super(message);
        this.name = "RaurusRuntimeError";
        this.code = code;
        this.cause = cause;
    }
}

export const isRaurusRuntimeError = (
    value: unknown
): value is RaurusRuntimeError => value instanceof RaurusRuntimeError;
