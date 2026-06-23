import { describe, expect, expectTypeOf, it } from "vitest";

import { getLogger } from "./get-logger";

describe(getLogger, () => {
    it('returns a logger scoped to ["raurus"] when called with no arguments', () => {
        const log = getLogger();
        expect(log).toBeDefined();
        expectTypeOf(log.info).toBeFunction();
    });

    it("returns a logger scoped to a sub-category when called with a package name", () => {
        const log = getLogger("core");
        expect(log).toBeDefined();
        expectTypeOf(log.warn).toBeFunction();
    });

    it("returns a logger scoped to a deeper sub-category when called with multiple arguments", () => {
        const log = getLogger("core", "adapters");
        expect(log).toBeDefined();
        expectTypeOf(log.debug).toBeFunction();
    });
});
