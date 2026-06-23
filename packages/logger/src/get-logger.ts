import { getLogger as logTapeGetLogger } from "@logtape/logtape";
import type { Logger } from "@logtape/logtape";

const RaurusLoggerCategory = ["raurus"] as const;

/**
 * Returns a LogTape {@link Logger} scoped to `["raurus", ...rest]`.
 *
 * @example
 * ```ts
 * const log = getLogger("server");
 * log.info("Health check passed");
 * ```
 *
 * @example
 * ```ts
 * const log = getLogger("server", "adapters");
 * log.info("Loaded adapter {name}", { name: "s3" });
 * ```
 */
export const getLogger = (...rest: readonly string[]): Logger => {
    const category: readonly string[] = rest.length === 0 ? RaurusLoggerCategory : [...RaurusLoggerCategory, ...rest];
    return logTapeGetLogger(category);
};

export type { Logger } from "@logtape/logtape";
