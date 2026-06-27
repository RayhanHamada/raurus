import { ansiColorFormatter, configureSync, getConsoleSink } from "@logtape/logtape";
import type { Config, Filter } from "@logtape/logtape";

/**
 * Logical package names within the Raurus monorepo that get their own
 * pre-configured logger category.  Add a new entry here whenever a new
 * workspace package needs to emit logs.
 */
export const RaurusPackageNames = ["core", "server", "logger"] as const;

export type RaurusPackageName = (typeof RaurusPackageNames)[number];

/**
 * Lowest log level per package when `NODE_ENV !== "production"`.  Override
 * at runtime by mutating this object before calling
 * `configure({ ...logTapeConfig, loggers: [...] })`.
 */
export const developmentLogLevels: Record<RaurusPackageName, "debug"> = {
    core: "debug",
    server: "debug",
    logger: "debug",
};

/**
 * Lowest log level per package when `NODE_ENV === "production"`.
 */
export const productionLogLevels: Record<RaurusPackageName, "info"> = {
    core: "info",
    server: "info",
    logger: "info",
};

const resolveLogLevels = (): Record<RaurusPackageName, "debug" | "info"> => {
    if (typeof process !== "undefined" && process.env?.["NODE_ENV"] === "production") {
        return productionLogLevels;
    }
    return developmentLogLevels;
};

/**
 * Drop debug-level records that don't originate from a `["raurus", ...]`
 * category.  Lets us silence third-party debug noise without touching the
 * Raurus loggers themselves.
 */
const noDebugFromOthers: Filter = (record) => {
    const [root] = record.category;
    if (root === "raurus") {
        return true;
    }
    return record.level !== "debug";
};

/**
 * Pre-built {@link Config} object for LogTape.  Pass it directly to
 * `configure()` from the consuming application — this package never calls
 * `configure()` itself, per the LogTape library guidance.
 *
 * @example
 * ```ts
 * import { configure } from "@logtape/logtape";
 * import { logTapeConfig } from "@raurus/logger";
 *
 * await configure(logTapeConfig);
 * ```
 */
export const logTapeConfig: Config<"console", "noDebugFromOthers"> = {
    sinks: {
        console: getConsoleSink({ formatter: ansiColorFormatter }),
    },
    filters: {
        noDebugFromOthers,
    },
    loggers: RaurusPackageNames.map((name) => ({
        category: ["raurus", name],
        lowestLevel: resolveLogLevels()[name],
        sinks: ["console"],
    })),
};

export type { Config } from "@logtape/logtape";

export function initializeLogger() {
    configureSync(logTapeConfig);
}
