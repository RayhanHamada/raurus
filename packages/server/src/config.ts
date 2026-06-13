import type { OpenApiSpecificationOptions } from "itty-spec";

import type { CreateRaurusOptions } from "./types";

export const OPENAPI_CONFIG: OpenApiSpecificationOptions = {
    title: "Raurus OpenAPI",
    version: "1.0.0",
    description: "This is the OpenAPI specification for the Raurus server.",
    servers: [],
    license: { name: "MIT" },
};

export const DEFAULT_RUNTIME_OPTIONS = {
    docsPath: "/docs",
    specPath: "/openapi.json",
} as const satisfies Pick<CreateRaurusOptions, "docsPath" | "specPath">;
