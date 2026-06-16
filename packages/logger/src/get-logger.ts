import { getLogger as logTapeGetLogger } from "@logtape/logtape";
import type { Logger } from "@logtape/logtape";

import type { RaurusPackageName } from "./config";

const RaurusLoggerCategory = ["raurus"] as const;

/**
 * Returns a LogTape {@link Logger} scoped to a sub-category of the
 * `["raurus"]` root.  Most callers should prefer {@link getPackageLogger}
 * which scopes to a known package name.
 *
 * @example
 * ```ts
 * const log = getLogger(["raurus", "core", "adapters"]);
 * log.info("Loaded adapter {name}", { name: "s3" });
 * ```
 */
export const getLogger = (...rest: readonly string[]): Logger => {
    const category: readonly string[] = rest.length === 0 ? RaurusLoggerCategory : [...RaurusLoggerCategory, ...rest];
    return logTapeGetLogger(category);
};

/**
 * Returns a LogTape {@link Logger} scoped to `["raurus", <packageName>]`,
 * matching the corresponding entry in {@link logTapeConfig}.
 *
 * @example
 * ```ts
 * // inside @raurus/server
 * const log = getPackageLogger("server");
 * log.debug("Health check passed");
 * ```
 */
export const getPackageLogger = (name: RaurusPackageName): Logger => logTapeGetLogger(["raurus", name]);

export type { Logger } from "@logtape/logtape";
