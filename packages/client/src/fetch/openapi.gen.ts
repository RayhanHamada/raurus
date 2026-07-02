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
    "/_raurus/placeholders/{placeholder_id}/pathnames/{pathname}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Upsert Metadata
         * @description Create or update a metadata record for a placeholder.
         */
        put: operations["put_raurusPlaceholdersByPlaceholder_idPathnamesByPathname"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/_raurus/assets/presigned-upload-url": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Presigned Upload URL
         * @description Generate a presigned URL for uploading an asset to a storage service.
         */
        get: operations["get_raurusAssetsPresigned-upload-url"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/_raurus/asset/{asset_key}": {
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
         * @description Delete an asset from the storage service.
         */
        delete: operations["delete_raurusAssetByAsset_key"];
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
                        data: {
                            database_adapter_id: (string | null) | null;
                            storage_adapter_id: (string | null) | null;
                        };
                    };
                };
            };
        };
    };
    put_raurusPlaceholdersByPlaceholder_idPathnamesByPathname: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                placeholder_id: string;
                pathname: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    type: "photo" | "video";
                    asset_key: string;
                } | {
                    /** @constant */
                    type: "text";
                    text: string;
                };
                "application/x-www-form-urlencoded": {
                    type: "photo" | "video";
                    asset_key: string;
                } | {
                    /** @constant */
                    type: "text";
                    text: string;
                };
                "multipart/form-data": {
                    type: "photo" | "video";
                    asset_key: string;
                } | {
                    /** @constant */
                    type: "text";
                    text: string;
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
    "get_raurusAssetsPresigned-upload-url": {
        parameters: {
            query: {
                asset_key: Record<string, never>;
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
    delete_raurusAssetByAsset_key: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                asset_key: string;
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
}
