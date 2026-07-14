import type { FailureCode } from "@/core";

/**
 * Maps a {@link FailureCode} from `@raurus/core` to an HTTP status. Used by
 * ORPCError throws in procedure handlers to translate adapter failures into
 * consistent HTTP responses without inspecting the `Error.message` string.
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
