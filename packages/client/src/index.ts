import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import type { Contracts } from "@raurus/contract";

export { contracts } from "@raurus/contract";

/**
 * Creates a fully-typed RPC client for the Raurus API.
 *
 * Each procedure (`upsertMetadata`, `getPresignedUploadUrl`,
 * `deleteAsset`, `listMetadataByPathname`) is callable with the
 * correct input/output types inferred from the Valibot schemas
 * defined in `@raurus/contract`.
 *
 * @param url - Base URL of the Raurus runtime (e.g. `"http://localhost:3000/_raurus"`).
 */
export function createRaurusClient(url: string) {
    const link = new RPCLink({
        url,
        fetch: (request, init) =>
            globalThis.fetch(request, {
                ...init,
                credentials: "include", // Include cookies for cross-origin requests
            }),
        interceptors: [],
    });

    return createORPCClient(link) as ContractRouterClient<Contracts>;
}
