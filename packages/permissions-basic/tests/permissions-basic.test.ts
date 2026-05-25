import { describe, expect, test, vi } from "vitest";

import { basicPermissions } from "../src";

describe("@raurus/permissions-basic", () => {
    test("delegates to the configured callback", async () => {
        const canEdit = vi.fn<() => Promise<boolean>>(() =>
            Promise.resolve(true)
        );
        const adapter = basicPermissions({ canEdit });

        await expect(
            adapter.canEdit({ user: { role: "admin" } })
        ).resolves.toBeTruthy();
        expect(canEdit).toHaveBeenCalledWith({ user: { role: "admin" } });
    });
});
