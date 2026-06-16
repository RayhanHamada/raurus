import { describe, expect, expectTypeOf, it } from "vitest";

import { getLogger, getPackageLogger } from "./get-logger";

describe(getLogger, () => {
    it('returns a logger scoped to ["raurus"] when called with no arguments', () => {
        const log = getLogger();
        expect(log).toBeDefined();
        expectTypeOf(log.info).toBeFunction();
    });

    it("returns a logger scoped to a sub-category when called with arguments", () => {
        const log = getLogger("core", "adapters");
        expect(log).toBeDefined();
        expectTypeOf(log.debug).toBeFunction();
    });
});

describe(getPackageLogger, () => {
    it("returns a logger for a known package", () => {
        const log = getPackageLogger("core");
        expect(log).toBeDefined();
        expectTypeOf(log.warn).toBeFunction();
    });
});
