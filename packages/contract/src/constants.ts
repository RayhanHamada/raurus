// ---------------------------------------------------------------------------
// Shared constants — reusable across contract, server, and other packages
// ---------------------------------------------------------------------------

/** Discriminator values for metadata payloads. */
export const METADATA_TYPES = {
    PHOTO: "photo",
    TEXT: "text",
    LINK: "link",
} as const;

/** Canonical failure codes returned by adapters and server routes. */
export const FAILURE_CODES = {
    NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
    NOT_FOUND: "NOT_FOUND",
    CONFLICT: "CONFLICT",
    CONFIGURATION: "CONFIGURATION",
    CONNECTION: "CONNECTION",
    PERMISSION: "PERMISSION",
    RATE_LIMIT: "RATE_LIMIT",
    UPSTREAM: "UPSTREAM",
    INVALID_INPUT: "INVALID_INPUT",
    UNKNOWN: "UNKNOWN",
} as const;

/** Standard success / error response messages. */
export const RESPONSE_MESSAGES = {
    OK: "OK",
    ERROR: "Error",
} as const;
