import { useCallback, useEffect, useState } from "react";

import { useRaurus } from "./RaurusProvider";

interface ContentState {
    content: Record<string, unknown> | null;
    isLoading: boolean;
    error: string | null;
}

interface TextUpdate {
    type: "text";
    text: string;
}

interface MediaUpdate {
    type: "photo" | "video";
    assetKey: string;
}

type ContentUpdate = TextUpdate | MediaUpdate;

export function useContent(placeholderId: string) {
    const { baseUrl, registerPlaceholder } = useRaurus();
    const [state, setState] = useState<ContentState>({
        content: null,
        isLoading: false,
        error: null,
    });

    useEffect(() => {
        registerPlaceholder(placeholderId);
    }, [placeholderId, registerPlaceholder]);

    const token = typeof window === "undefined" ? null : window.localStorage.getItem("raurus_token");

    const fetchContent = useCallback(async () => {
        if (!token) {
            return;
        }
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await fetch(`${baseUrl}/metadata/${encodeURIComponent(placeholderId)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 404) {
                setState({ content: null, isLoading: false, error: null });
                return;
            }

            if (!response.ok) {
                const json = await response.json();
                setState({ content: null, isLoading: false, error: json.error ?? "Failed to fetch content" });
                return;
            }

            const json = await response.json();
            setState({ content: json, isLoading: false, error: null });
        } catch (error) {
            setState({
                content: null,
                isLoading: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }, [baseUrl, placeholderId, token]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const update = useCallback(
        async (data: ContentUpdate) => {
            if (!token) {
                return;
            }
            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                const response = await fetch(`${baseUrl}/metadata/${encodeURIComponent(placeholderId)}`, {
                    method: "PUT",
                    headers: {
                        "content-type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const json = await response.json();
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: json.error ?? "Failed to update content",
                    }));
                    return;
                }

                await fetchContent();
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                }));
            }
        },
        [baseUrl, placeholderId, token, fetchContent]
    );

    return { content: state.content, isLoading: state.isLoading, error: state.error, update };
}
