import { writeFile } from "node:fs/promises";
import path from "node:path";

import { raurus } from "@raurus/server";
import openapiTS, { astToString } from "openapi-typescript";
import ts from "typescript";

const BLOB = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Blob")); // `Blob`
const NULL = ts.factory.createLiteralTypeNode(ts.factory.createNull()); // `null`

const OUTPUT = path.resolve(process.cwd(), "src", "openapi.gen.ts");
const BASE_URL = "http://api.example.com";
const JSON_PATH = "/_raurus/openapi/json";

const app = raurus({ baseUrl: BASE_URL });
const req = new Request(new URL(JSON_PATH, BASE_URL));
const res = await app.fetch(req);
const json = await res.json();
const ast = await openapiTS(json, {
    transform(schemaObject) {
        if (schemaObject.format === "binary") {
            return schemaObject.nullable ? ts.factory.createUnionTypeNode([BLOB, NULL]) : BLOB;
        }
    },
});
const contents = astToString(ast);

await writeFile(OUTPUT, contents, { encoding: "utf-8" });
