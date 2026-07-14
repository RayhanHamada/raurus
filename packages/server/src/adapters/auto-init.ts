import type { CommonRuntimeAdapter } from "@/core";

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/** Marker to detect already-wrapped adapters (double-wrap guard). */
const AUTO_INIT_SYMBOL = Symbol.for("raurus:auto-inited");

/** Error thrown when calling any method on a closed adapter. */
const CLOSED_ERROR = new Error("Adapter is closed");

/** Cooldown between init retries after a failure (ms). */
const INIT_RETRY_COOLDOWN_MS = 5000;

// Properties that must NOT trigger the lazy-init machinery.
const PASSTHROUGH_PROPS = new Set<string | symbol>([
    "then",
    "catch",
    "toJSON",
    "inspect",
    // Third-party inspection / logging utilities
    "toString",
    "valueOf",
    Symbol.toStringTag,
    Symbol.toPrimitive,
    Symbol.iterator,
    Symbol.asyncIterator,
]);

// ---------------------------------------------------------------------------
// withAutoInit
// ---------------------------------------------------------------------------

/**
 * Wraps an adapter so that {@link AdapterLifecycle.init} is called lazily on
 * the first method invocation, exactly once, with concurrency safety,
 * retry-on-failure with cooldown, and close() poisoning.
 *
 * @returns The adapter, wrapped. If the adapter is already wrapped the same
 *          instance is returned (idempotent).
 */
export function withAutoInit<T extends CommonRuntimeAdapter>(adapter: T) {
    // Already wrapped? Return as-is — avoids double-proxying.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((adapter as Record<symbol, unknown>)[AUTO_INIT_SYMBOL]) {
        return adapter;
    }

    let initPromise: Promise<void> | null = null;
    let lastFailureTime = 0;
    let closed = false;

    const ensureInit = (): Promise<void> => {
        if (closed) {
            return Promise.reject(CLOSED_ERROR);
        }
        if (initPromise) {
            return initPromise;
        }

        // Retry cooldown: don't hammer the upstream on persistent failures.
        const now = Date.now();
        if (lastFailureTime > 0 && now - lastFailureTime < INIT_RETRY_COOLDOWN_MS) {
            return Promise.reject(new Error("Adapter initialization failed recently — cooling down before retry"));
        }

        initPromise = (async () => {
            try {
                await adapter.init();
                // Success — keep initPromise set so subsequent calls short-circuit.
            } catch (error) {
                lastFailureTime = Date.now();
                initPromise = null; // Reset so the next call retries after cooldown.
                throw error;
            }
        })();

        return initPromise;
    };

    const proxiedClose = (): Promise<void> => {
        closed = true;
        initPromise = null;
        return adapter.close();
    };

    return new Proxy(adapter, {
        get(target, prop, receiver) {
            // Well-known symbols and internal marker: pass through.
            if (typeof prop === "symbol") {
                if (prop === AUTO_INIT_SYMBOL) {
                    return true;
                }
                return Reflect.get(target, prop, receiver);
            }

            // Properties that must never trigger lazy init.
            if (PASSTHROUGH_PROPS.has(prop)) {
                return Reflect.get(target, prop, receiver);
            }

            const value = Reflect.get(target, prop, receiver);

            // Property accesses (non-functions): pass through directly.
            // Documented constraint: init-dependent state must be exposed via
            // methods, not getters.
            if (typeof value !== "function") {
                return value;
            }

            // Lifecycle methods: proxy close(), pass init() through.
            if (prop === "close") {
                return proxiedClose;
            }
            if (prop === "init") {
                return (target as T).init.bind(target);
            }

            // All other methods: intercept, ensure init, then delegate.
            return function get(this: unknown, ...args: unknown[]) {
                return ensureInit().then(() => value.apply(this === receiver ? target : this, args));
            };
        },
    });
}
