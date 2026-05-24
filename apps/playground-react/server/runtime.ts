import { resolve } from "node:path";

import { createRaurusRuntime, isRaurusRuntimeError } from "@raurus/core";
import { sqliteMetadataAdapter } from "@raurus/metadata-sqlite";
import { basicPermissions } from "@raurus/permissions-basic";
import { localStorageAdapter } from "@raurus/storage-local";

const currentDirectory = import.meta.dirname;
const appDirectory = resolve(currentDirectory, "..");

const runtime = createRaurusRuntime({
    metadata: sqliteMetadataAdapter({
        dbPath: resolve(appDirectory, "raurus.db"),
    }),
    permissions: basicPermissions({
        canEdit() {
            return true;
        },
    }),
    storage: localStorageAdapter({
        publicBaseUrl: "/uploads",
        uploadDir: resolve(appDirectory, "public", "uploads"),
    }),
});

export { isRaurusRuntimeError, runtime };
