import { raurus } from "@raurus/server";
import { createMemoryMetadataAdapter } from "@raurus/server/adapters/example-metadata-adapter";
import { createMemoryStorageAdapter } from "@raurus/server/adapters/example-storage-adapter";

const server = raurus({
    baseUrl: "http://localhost:3000/api",
    metadataAdapter: createMemoryMetadataAdapter(),
    storageAdapter: createMemoryStorageAdapter(),
});

console.log(`Raurus server listening on http://localhost:3000`);
console.log(`  API:  http://localhost:3000/api`);
console.log(`  Docs: http://localhost:3000/api/docs`);
console.log(`  Spec: http://localhost:3000/api/openapi.json`);

export default { port: 3000, fetch: server.fetch };
