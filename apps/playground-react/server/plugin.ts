import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";

import type { Plugin } from "vite";

import { isRaurusRuntimeError, runtime } from "./runtime";

const API_PREFIX = "/api/raurus";

const sendJson = (
    response: ServerResponse,
    statusCode: number,
    payload: unknown
): void => {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(payload));
};

const readFormData = (request: IncomingMessage): Promise<FormData> => {
    const { headers, method, url } = request;
    const requestInit = {
        body: Readable.toWeb(request) as BodyInit,
        duplex: "half" as const,
        headers: headers as HeadersInit,
        method,
    } as RequestInit & { duplex: "half" };
    const incomingRequest = new Request(`http://localhost${url}`, {
        ...requestInit,
    });

    return incomingRequest.formData();
};

const getStatusCode = (error: unknown): number => {
    if (!isRaurusRuntimeError(error)) {
        return 500;
    }

    switch (error.code) {
        case "INVALID_MIME_TYPE": {
            return 400;
        }
        case "FILE_TOO_LARGE": {
            return 400;
        }
        case "PERMISSION_DENIED": {
            return 403;
        }
        case "MISSING_ASSET": {
            return 404;
        }
        default: {
            return 500;
        }
    }
};

const handleApiRequest = async (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
): Promise<void> => {
    const { url } = request;

    if (!url?.startsWith(API_PREFIX)) {
        next();
        return;
    }

    const requestUrl = new URL(url, "http://localhost");

    try {
        if (requestUrl.pathname === `${API_PREFIX}/permissions`) {
            sendJson(response, 200, { canEdit: await runtime.canEdit() });
            return;
        }

        if (!requestUrl.pathname.startsWith(`${API_PREFIX}/assets/`)) {
            sendJson(response, 404, { message: "Unknown Raurus API route." });
            return;
        }

        const assetId = decodeURIComponent(
            requestUrl.pathname.replace(`${API_PREFIX}/assets/`, "")
        );

        if (request.method === "GET") {
            sendJson(response, 200, await runtime.getAsset(assetId));
            return;
        }

        if (request.method === "DELETE") {
            await runtime.removeAsset(assetId);
            sendJson(response, 200, { ok: true });
            return;
        }

        if (request.method === "POST") {
            const formData = await readFormData(request);
            const file = formData.get("file");

            if (!(file instanceof File)) {
                sendJson(response, 400, {
                    message: "Expected a file upload in the 'file' field.",
                });
                return;
            }

            sendJson(response, 200, await runtime.replaceAsset(assetId, file));
            return;
        }

        sendJson(response, 405, { message: "Method not allowed." });
    } catch (error) {
        sendJson(response, getStatusCode(error), {
            message:
                error instanceof Error
                    ? error.message
                    : "Unexpected Raurus playground error.",
        });
    }
};

export const raurusPlaygroundPlugin = (): Plugin => ({
    configureServer(server) {
        server.middlewares.use((request, response, next) => {
            void handleApiRequest(request, response, next);
        });
    },
    name: "raurus-playground-api",
});
