import { describe, expect, it } from "vitest";

import { RaurusPackageNames, logTapeConfig } from "./config";

describe("the LogTape config object", () => {
    it("defines a console sink", () => {
        expect(logTapeConfig.sinks).toBeDefined();
        expect(logTapeConfig.sinks).toHaveProperty("console");
    });

    it("configures a logger for every known Raurus package", () => {
        const categories = logTapeConfig.loggers.map((l) => {
            const cat = l.category;
            return Array.isArray(cat) ? cat : [cat];
        });

        for (const name of RaurusPackageNames) {
            const expected: readonly string[] = ["raurus", name];
            expect(categories).toContainEqual(expected);
        }
    });

    it("routes every Raurus package logger to the console sink", () => {
        for (const logger of logTapeConfig.loggers) {
            expect(logger.sinks).toStrictEqual(["console"]);
        }
    });

    it("exposes a lowestLevel on every logger", () => {
        for (const logger of logTapeConfig.loggers) {
            expect(["trace", "debug", "info", "warning", "error", "fatal"]).toContain(logger.lowestLevel);
        }
    });
});
