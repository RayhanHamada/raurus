import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

import type { StorageAdapter, StoredAsset } from "@raurus/core";

export interface LocalStorageAdapterOptions {
    uploadDir: string;
    publicBaseUrl: string;
}

const getExtension = (fileName: string): string => {
    const extension = extname(fileName).toLowerCase();
    return extension === ".jpeg" ? ".jpg" : extension;
};

const toPublicUrl = (publicBaseUrl: string, key: string): string => {
    const normalizedBase = publicBaseUrl.endsWith("/")
        ? publicBaseUrl.slice(0, -1)
        : publicBaseUrl;

    return `${normalizedBase}/${key}`;
};

export const localStorageAdapter = (
    options: LocalStorageAdapterOptions
): StorageAdapter => ({
    async delete(key: string): Promise<void> {
        const path = join(options.uploadDir, basename(key));
        await rm(path, { force: true });
    },

    async upload(file: File): Promise<StoredAsset> {
        await mkdir(options.uploadDir, { recursive: true });

        const extension = getExtension(file.name);
        const key = `${randomUUID()}${extension}`;
        const path = join(options.uploadDir, basename(key));
        const bytes = new Uint8Array(await file.arrayBuffer());

        await writeFile(path, bytes);

        return {
            key,
            mimeType: file.type,
            size: file.size,
            url: toPublicUrl(options.publicBaseUrl, key),
        };
    },
});
