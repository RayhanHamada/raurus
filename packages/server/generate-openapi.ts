import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createOpenApiSpecification } from "itty-spec";

import { OPENAPI_CONFIG } from "@/config";
import { contract } from "@/contract";

const spec = await createOpenApiSpecification(contract, OPENAPI_CONFIG);
const output = resolve(process.cwd(), "openapi.json");

await writeFile(output, JSON.stringify(spec), "utf-8");

console.log(`OpenAPI spec written to ${output}`);
