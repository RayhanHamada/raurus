import { RPCHandler } from "@orpc/server/fetch";

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
 */
export function createRuntime(config: CreateRuntimeOptions) {
    const options = { ...DEFAULT_RUNTIME_OPTIONS, ...config };

    if (options.debug) {
        initializeLogger();
    }

    const url = URL.parse(options.baseUrl);
    if (!url) {
        const baseUrl = options.baseUrl.toString();
        log.error("Invalid baseUrl provided", { baseUrl });
        throw new Error(`Invalid baseUrl: ${baseUrl}`);
    }

    const prefix = (url.pathname === "/" ? "/_raurus" : url.pathname) as `/${string}`;

    log.info("Raurus runtime initialized", { basePath: prefix, origin: url.origin });

    const handler = new RPCHandler(router, {
        plugins: [],
    });

    const context = {
        db: options.databaseAdapter,
        storage: options.storageAdapter,
    } satisfies ServerContext;

    return {
        fetch: async (request: Request) => {
            const { response } = await handler.handle(request, {
                prefix,
                context,
            });
            return response;
        },
    };
}
