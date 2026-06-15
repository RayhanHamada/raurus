import type { OpenAPIV3_1 } from "openapi-types";

import type { CreateRuntimeOptions } from "./types";

export const OPENAPI_CONFIG = {
    openapi: "3.1.1",
    info: {
        title: "Raurus OpenAPI",
        version: "1.0.0",
        description: "This is the OpenAPI specification for the Raurus server.",
        license: { name: "MIT" },
    },
} as OpenAPIV3_1.Document<Record<string, unknown>>;

export const DEFAULT_RUNTIME_OPTIONS = {
    basePath: "/_raurus",
    openapi: true,
} as const satisfies Partial<CreateRuntimeOptions>;
