import { RPCHandler } from "@orpc/server/fetch";

import { withAutoInit } from "@/adapters/auto-init";
import type { RuntimeDatabaseAdapter, RuntimeStorageAdapter } from "@/core";
import { initializeLogger, log } from "@/runtime/utils";

import { router } from "./routes";
import type { ServerContext } from "./routes";

/**
 * Options for creating a Raurus runtime instance. The `databaseAdapter` and
 * `storageAdapter` are passed to every procedure handler via the oRPC
 * context.
 */
export interface CreateRuntimeOptions {
    /**
     * Base URL + base path for the API. Required.
     */
    baseUrl: string | URL;

    /**
     * The database adapter to use for the Raurus instance.
     */
    databaseAdapter: RuntimeDatabaseAdapter;

    /**
     * The storage adapter to use for the Raurus instance.
     */
    storageAdapter: RuntimeStorageAdapter;

    /**
     * Whether to enable debug logging. Defaults to `false`.
     *
     * @default false
     */
    debug?: boolean;
}

const DEFAULT_RUNTIME_OPTIONS = {
    debug: false,
} satisfies Partial<CreateRuntimeOptions>;

/**
 * Creates a runtime instance for handling API requests related to metadata
 * and asset management. Returns a fetch-compatible handler backed by the
 * oRPC {@link OpenAPIHandler}.
 *
 * The returned object includes a `close()` method that gracefully shuts down
 * both adapters. After `close()`, further calls to `fetch()` will reject.
 */
export function createRuntime(config: CreateRuntimeOptions) {
    const options = { ...DEFAULT_RUNTIME_OPTIONS, ...config };

    if (options.debug) {
        initializeLogger();
    }

    // new URL() is used instead of URL.parse() for broad runtime compatibility
    // (including older Cloudflare Workers compatibility dates).
    let url: URL;
    try {
        url = new URL(options.baseUrl);
    } catch {
        const baseUrl = options.baseUrl.toString();
        log.error("Invalid baseUrl provided", { baseUrl });
        throw new Error(`Invalid baseUrl: ${baseUrl}`);
    }

    const prefix = (url.pathname === "/" ? "/_raurus" : url.pathname) as `/${string}`;

    // Wrap adapters so init() runs lazily on the first request, concurrency-safe.
    const db = withAutoInit(options.databaseAdapter);
    const storage = withAutoInit(options.storageAdapter);

    log.info("Raurus runtime created", { basePath: prefix, origin: url.origin });

    const handler = new RPCHandler(router, {
        plugins: [],
    });

    const context = {
        db,
        storage,
    } satisfies ServerContext;

    return {
        fetch: async (request: Request) => {
            const { response } = await handler.handle(request, {
                prefix,
                context,
            });
            return response;
        },
        /** Gracefully shutdown both adapters. Irreversible. */
        close: () => {
            log.info("Shutting down Raurus runtime");
            return Promise.all([db.close(), storage.close()]);
        },
    };
}
