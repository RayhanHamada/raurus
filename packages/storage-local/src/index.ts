import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, extname } from "node:path";
import type { RuntimeStorageAdapterBaseConfig, RuntimeStorageAdapterFactory } from "@raurus/core";

interface LocalStorageAdapterConfig extends RuntimeStorageAdapterBaseConfig {
    basePath: string;
}

const CONTENT_TYPES: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".bin": "application/octet-stream",
};

function detectContentType(filename: string): string {
    const ext = extname(filename).toLowerCase();
    return CONTENT_TYPES[ext] || "application/octet-stream";
}

export const createLocalStorageAdapter: RuntimeStorageAdapterFactory<
    LocalStorageAdapterConfig,
    "local-storage-adapter"
> = (config) => {
    const basePath = config!.basePath;

    return {
        id: "local-storage-adapter",
        apiVersion: "1",

        async checkConnection() {
            try {
                await mkdir(basePath, { recursive: true });
                return { ok: true, data: null };
            } catch (err) {
                return {
                    ok: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                    code: "CONNECTION" as const,
                };
            }
        },

        async uploadAsset(assetKey, asset) {
            try {
                const filePath = `${basePath}/${assetKey}`;
                await mkdir(dirname(filePath), { recursive: true });
                await writeFile(filePath, new Uint8Array(asset));
                return { ok: true, data: { assetKey } };
            } catch (err) {
                return {
                    ok: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                    code: "CONNECTION" as const,
                };
            }
        },

        async deleteAsset(assetKey) {
            try {
                const filePath = `${basePath}/${assetKey}`;
                await unlink(filePath);
                return { ok: true, data: null };
            } catch (err) {
                if (err instanceof Error && "code" in err && err.code === "ENOENT") {
                    return {
                        ok: false,
                        error: new Error(`Asset not found: ${assetKey}`),
                        code: "NOT_FOUND" as const,
                    };
                }
                return {
                    ok: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                    code: "CONNECTION" as const,
                };
            }
        },

        async getAssetContent(assetKey) {
            try {
                const filePath = `${basePath}/${assetKey}`;
                const buffer = await readFile(filePath);
                const contentType = detectContentType(assetKey);
                return {
                    ok: true,
                    data: {
                        data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
                        contentType,
                    },
                };
            } catch (err) {
                if (err instanceof Error && "code" in err && err.code === "ENOENT") {
                    return {
                        ok: false,
                        error: new Error(`Asset not found: ${assetKey}`),
                        code: "NOT_FOUND" as const,
                    };
                }
                return {
                    ok: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                    code: "CONNECTION" as const,
                };
            }
        },

        async createPresignedUploadUrl(assetKey) {
            return {
                ok: true,
                data: { url: `/_raurus/upload-asset?assetKey=${encodeURIComponent(assetKey)}` },
            };
        },

        async createPresignedDownloadUrl(assetKey) {
            return {
                ok: true,
                data: { url: `/_raurus/asset-content/${encodeURIComponent(assetKey)}` },
            };
        },
    };
};
