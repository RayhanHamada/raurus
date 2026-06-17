// oxlint-disable typescript/no-non-null-assertion
import createClient from "openapi-fetch";
import type { HeadersOptions } from "openapi-fetch";

import type { paths } from "@/openapi.gen";

export interface Options {
    baseUrl: string;
    headers?: HeadersOptions;
}

export function createApiClient(options: Options) {
    return createClient<paths>({
        baseUrl: options.baseUrl,
        headers: options.headers ?? {},
    });
}
