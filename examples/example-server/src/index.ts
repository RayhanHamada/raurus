import { createSimplePasswordAuth } from "@raurus/auth-simple-password";
import { createLibsqlMetadataAdapter } from "@raurus/metadata-libsql";
import { raurus } from "@raurus/server";
import { createLocalStorageAdapter } from "@raurus/storage-local";

const server = raurus({
    baseUrl: "http://localhost:3000",
    metadataAdapter: createLibsqlMetadataAdapter({ url: "file:./data.db" }),
    storageAdapter: createLocalStorageAdapter({ basePath: "./uploads" }),
    authAdapter: createSimplePasswordAuth({ password: "admin123" }),
});

console.log(`Raurus server listening on http://localhost:3000`);
console.log(`  API:  http://localhost:3000/_raurus`);
console.log(`  Docs: http://localhost:3000/_raurus/docs`);
console.log(`  Spec: http://localhost:3000/_raurus/openapi.json`);

export default { port: 3000, fetch: server.fetch };
