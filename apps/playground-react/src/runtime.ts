import type { AssetRecord, RaurusRuntime } from "@raurus/core";

const API_BASE = "/api/raurus";

const createError = async (response: Response): Promise<Error> => {
    try {
        const payload = (await response.json()) as { message?: string };
        return new Error(payload.message ?? "Raurus request failed.");
    } catch {
        return new Error(
            `Raurus request failed with status ${response.status}.`
        );
    }
};

const requestJson = async <T>(
    input: string,
    init?: RequestInit
): Promise<T> => {
    const response = await fetch(input, init);

    if (!response.ok) {
        throw await createError(response);
    }

    return (await response.json()) as T;
};

export const playgroundRuntime: RaurusRuntime = {
    async canEdit(): Promise<boolean> {
        const payload = await requestJson<{ canEdit: boolean }>(
            `${API_BASE}/permissions`
        );
        return payload.canEdit;
    },

    getAsset(id: string): Promise<AssetRecord | null> {
        return requestJson<AssetRecord | null>(
            `${API_BASE}/assets/${encodeURIComponent(id)}`
        );
    },

    async removeAsset(id: string): Promise<void> {
        await requestJson(`${API_BASE}/assets/${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
    },

    replaceAsset(id: string, file: File): Promise<AssetRecord> {
        const formData = new FormData();
        formData.set("file", file);

        return requestJson<AssetRecord>(
            `${API_BASE}/assets/${encodeURIComponent(id)}`,
            {
                body: formData,
                method: "POST",
            }
        );
    },
};
