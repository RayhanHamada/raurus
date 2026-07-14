import { describe, expect, it, vi } from "vitest";

import type { CommonRuntimeAdapter } from "@/core";

import { withAutoInit } from "./auto-init";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockAdapter(overrides?: Partial<CommonRuntimeAdapter>): CommonRuntimeAdapter {
    return {
        apiVersion: "1",
        init: vi.fn<() => Promise<void>>().mockResolvedValue(),
        close: vi.fn<() => Promise<void>>().mockResolvedValue(),
        checkConnection: vi.fn<() => Promise<{ ok: true; data: null }>>().mockResolvedValue({ ok: true, data: null }),
        ...overrides,
    } as CommonRuntimeAdapter;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe(withAutoInit, () => {
    // -- lazy init --------------------------------------------------------------

    it("calls init() lazily on the first intercepted method call", async () => {
        const adapter = mockAdapter();
        const wrapped = withAutoInit(adapter);

        expect(adapter.init).not.toHaveBeenCalled();

        await wrapped.checkConnection();
        expect(adapter.init).toHaveBeenCalledOnce();
    });

    it("calls init() only once across multiple method calls", async () => {
        const adapter = mockAdapter();
        const wrapped = withAutoInit(adapter);

        await wrapped.checkConnection();
        await wrapped.checkConnection();
        await wrapped.checkConnection();

        expect(adapter.init).toHaveBeenCalledOnce();
    });

    // -- concurrency safety -----------------------------------------------------

    it("is concurrency-safe: multiple concurrent callers share the same init promise", async () => {
        let resolveInit!: () => void;
        const adapter = mockAdapter({
            init: vi.fn<() => Promise<void>>().mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveInit = resolve;
                    })
            ),
        });
        const wrapped = withAutoInit(adapter);

        const p1 = wrapped.checkConnection();
        const p2 = wrapped.checkConnection();
        const p3 = wrapped.checkConnection();

        resolveInit();
        await Promise.all([p1, p2, p3]);

        expect(adapter.init).toHaveBeenCalledOnce();
    });

    // -- retry on failure -------------------------------------------------------

    it("retries init() after a failure (reset on reject)", async () => {
        vi.useFakeTimers();

        const adapter = mockAdapter({
            init: vi.fn<() => Promise<void>>().mockRejectedValueOnce(new Error("transient")).mockResolvedValueOnce(),
        });
        const wrapped = withAutoInit(adapter);

        // First attempt — fails.
        await expect(wrapped.checkConnection()).rejects.toThrow("transient");

        // Advance past cooldown so the next call will retry.
        vi.advanceTimersByTime(6000);

        // Second call should succeed (retry after cooldown).
        await wrapped.checkConnection();

        expect(adapter.init).toHaveBeenCalledTimes(2);

        vi.useRealTimers();
    });

    // -- close poisoning --------------------------------------------------------

    it("throws on any method call after close()", async () => {
        const adapter = mockAdapter();
        const wrapped = withAutoInit(adapter);

        await wrapped.close();

        await expect(wrapped.checkConnection()).rejects.toThrow("closed");
        expect(adapter.close).toHaveBeenCalledOnce();
    });

    it("close() delegates to the underlying adapter", async () => {
        const adapter = mockAdapter();
        const wrapped = withAutoInit(adapter);

        await wrapped.close();

        expect(adapter.close).toHaveBeenCalledOnce();
    });

    // -- pass-through: properties and special methods ---------------------------

    it("passes through non-method property access without triggering init", async () => {
        const adapter = mockAdapter();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wrapped = withAutoInit(adapter) as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        wrapped.id = "test-adapter";

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const { id } = wrapped;
        expect(id).toBe("test-adapter");
        expect(adapter.init).not.toHaveBeenCalled();
    });

    it("does not trigger init for then/catch (not-thenable safety)", async () => {
        const adapter = mockAdapter();
        const wrapped = withAutoInit(adapter);

        // Promise.resolve() inspects .then — must not trigger init.
        await Promise.resolve(wrapped);
        expect(adapter.init).not.toHaveBeenCalled();
    });

    it("passes through Symbol properties without triggering init", async () => {
        const adapter = mockAdapter();
        const wrapped = withAutoInit(adapter);

        // oxlint-disable-next-line typescript/no-explicit-any
        void (wrapped as unknown as Record<symbol, unknown>)[Symbol.toStringTag];
        void (wrapped as unknown as Record<symbol, unknown>)[Symbol.toPrimitive];

        expect(adapter.init).not.toHaveBeenCalled();
    });

    // -- double-wrap guard ------------------------------------------------------

    it("returns the same instance if already wrapped (double-wrap guard)", () => {
        const adapter = mockAdapter();
        const wrapped1 = withAutoInit(adapter);
        const wrapped2 = withAutoInit(wrapped1);

        expect(wrapped2).toBe(wrapped1);
    });

    // -- retry cooldown ---------------------------------------------------------

    it("rejects with a cooldown message if init failed recently and cooldown has not elapsed", async () => {
        vi.useFakeTimers();

        const adapter = mockAdapter({
            init: vi.fn<() => Promise<void>>().mockRejectedValue(new Error("boom")),
        });
        const wrapped = withAutoInit(adapter);

        // First attempt — fails.
        await expect(wrapped.checkConnection()).rejects.toThrow("boom");

        // Immediately try again — should be within cooldown.
        await expect(wrapped.checkConnection()).rejects.toThrow("cooling down");
        expect(adapter.init).toHaveBeenCalledOnce(); // Not retried yet.

        vi.useRealTimers();
    });

    it("retries init after the cooldown period has elapsed", async () => {
        vi.useFakeTimers();

        const adapter = mockAdapter({
            init: vi.fn<() => Promise<void>>().mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(),
        });
        const wrapped = withAutoInit(adapter);

        // First attempt — fails.
        await expect(wrapped.checkConnection()).rejects.toThrow("boom");

        // Advance past cooldown.
        vi.advanceTimersByTime(6000);

        // Second attempt should succeed.
        await expect(wrapped.checkConnection()).resolves.toBeDefined();
        expect(adapter.init).toHaveBeenCalledTimes(2);

        vi.useRealTimers();
    });

    // -- manual init() pass-through ---------------------------------------------

    it("allows calling init() directly (pass-through)", async () => {
        const adapter = mockAdapter();
        const wrapped = withAutoInit(adapter);

        await wrapped.init();
        expect(adapter.init).toHaveBeenCalledOnce();
    });
});
