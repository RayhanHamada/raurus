export interface paths {
    "/_raurus/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Health Check
         * @description A simple endpoint to check if the Raurus Rest API is running. It can be used for monitoring and health checks.
         */
        get: operations["get_raurus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/_raurus/presigned-url": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Presigned Upload URL
         * @description If implemented, this endpoint would generate a presigned URL for uploading an asset to a storage service.
         */
        get: operations["get_raurusPresigned-url"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/_raurus/presigned-download-url": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Presigned Download URL
         * @description If implemented, this endpoint would generate a presigned URL for downloading an asset from a storage service.
         */
        get: operations["get_raurusPresigned-download-url"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/_raurus/asset/{assetKey}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete Asset
         * @description If implemented, this endpoint would delete an asset from the storage service.
         */
        delete: operations["delete_raurusAssetByAssetKey"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/_raurus/upload-asset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload Asset
         * @description Endpoint to upload an asset using Raurus Rest API
         */
        post: operations["post_raurusUpload-asset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    get_raurus: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Response for status 200 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {string} */
                        status: "OK" | "Error";
                        /** @constant */
                        message: "RAURUS_ENDPOINT";
                    };
                };
            };
        };
    };
    "get_raurusPresigned-url": {
        parameters: {
            query: {
                assetKey: Record<string, never>;
                expiresIn?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Response for status 200 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "OK";
                        data: {
                            url: string;
                        };
                    };
                };
            };
            /** @description Response for status 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "Error";
                        error: string;
                    };
                };
            };
            /** @description Response for status 501 */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "Error";
                        error: string;
                    };
                };
            };
        };
    };
    "get_raurusPresigned-download-url": {
        parameters: {
            query: {
                assetKey: Record<string, never>;
                expiresIn?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Response for status 200 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "OK";
                        data: {
                            url: string;
                        };
                    };
                };
            };
            /** @description Response for status 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "Error";
                        error: string;
                    };
                };
            };
            /** @description Response for status 501 */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "Error";
                        error: string;
                    };
                };
            };
        };
    };
    delete_raurusAssetByAssetKey: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                assetKey: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Response for status 200 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "OK";
                    };
                };
            };
            /** @description Response for status 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "Error";
                        error: string;
                    };
                };
            };
            /** @description Response for status 404 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "Error";
                        error: string;
                    };
                };
            };
            /** @description Response for status 501 */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "Error";
                        error: string;
                    };
                };
            };
        };
    };
    "post_raurusUpload-asset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @default Files */
                    files: Blob[];
                };
                "application/x-www-form-urlencoded": {
                    /** @default Files */
                    files: Blob[];
                };
                "multipart/form-data": {
                    /** @default Files */
                    files: Blob[];
                };
            };
        };
        responses: {
            /** @description Response for status 200 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "OK";
                    };
                };
            };
            /** @description Response for status 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "Error";
                        error: string;
                    };
                };
            };
            /** @description Response for status 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "Error";
                        error: string;
                    };
                };
            };
            /** @description Response for status 501 */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        message: "Error";
                        error: string;
                    };
                };
            };
        };
    };
}
