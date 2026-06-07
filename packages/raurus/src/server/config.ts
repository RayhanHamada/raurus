import type { OpenApiSpecificationOptions } from "itty-spec";

import type { CreateRuntimeOptions } from "@/server/types";

export const openapiConfig: OpenApiSpecificationOptions = {
    title: "Raurus OpenAPI",
    version: "1.0.0",
    description: "This is the OpenAPI specification for the Raurus server.",
    servers: [],
    license: { name: "MIT" },
};

export const OPENAPI_JSON_PATH = "/openapi.json";

export const defaultRuntimeOptions = {
    basePath: "/api",
    docsPath: "/docs",
} as const satisfies CreateRuntimeOptions;
