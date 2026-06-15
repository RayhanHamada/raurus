import { createMemoryMetadataAdapter, createMemoryStorageAdapter } from "@raurus/adapter-memory";
import { raurus } from "@raurus/server";

const server = raurus({
    origin: "http://localhost:3000",
    metadataAdapter: createMemoryMetadataAdapter(),
    storageAdapter: createMemoryStorageAdapter(),
});

console.log(`Raurus server listening on http://localhost:3000`);
console.log(`  API:  http://localhost:3000/api`);
console.log(`  Docs: http://localhost:3000/api/docs`);
console.log(`  Spec: http://localhost:3000/api/openapi.json`);

export default { port: 3000, fetch: server.fetch };
