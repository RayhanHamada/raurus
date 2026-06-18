import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

interface RaurusContextValue {
    baseUrl: string;
    isEditing: boolean;
    isAuthenticated: boolean;
    selectedPlaceholderId: string | null;
    placeholderIds: string[];
    login: (password: string) => Promise<boolean>;
    logout: () => void;
    enterEditMode: () => Promise<void>;
    exitEditMode: () => void;
    selectPlaceholder: (id: string | null) => void;
    registerPlaceholder: (id: string) => void;
}

const RaurusContext = createContext<RaurusContextValue | null>(null);

export function useRaurus(): RaurusContextValue {
    const ctx = useContext(RaurusContext);
    if (!ctx) {
        throw new Error("useRaurus must be used within <RaurusProvider>");
    }
    return ctx;
}

interface RaurusProviderProps {
    baseUrl: string;
    children: ReactNode;
}

export function RaurusProvider({ baseUrl, children }: RaurusProviderProps) {
    const [authToken, setAuthToken] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return window.localStorage.getItem("raurus_token");
        }
        return null;
    });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPlaceholderId, setSelectedPlaceholderId] = useState<string | null>(null);
    const placeholderIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (authToken) {
                window.localStorage.setItem("raurus_token", authToken);
            } else {
                window.localStorage.removeItem("raurus_token");
            }
        }
    }, [authToken]);

    const login = useCallback(
        async (password: string): Promise<boolean> => {
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (!response.ok) {
                return false;
            }
            const json = await response.json();
            setAuthToken(json.data.token);
            return true;
        },
        [baseUrl]
    );

    const logout = useCallback(() => {
        setAuthToken(null);
        setIsEditing(false);
        setSelectedPlaceholderId(null);
    }, []);

    const enterEditMode = useCallback(async () => {
        if (!authToken) {
            return;
        }
        const response = await fetch(`${baseUrl}/auth/verify`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.ok) {
            setIsEditing(true);
        }
    }, [baseUrl, authToken]);

    const exitEditMode = useCallback(() => {
        setIsEditing(false);
        setSelectedPlaceholderId(null);
    }, []);

    const selectPlaceholder = useCallback((id: string | null) => {
        setSelectedPlaceholderId(id);
    }, []);

    const registerPlaceholder = useCallback((id: string) => {
        placeholderIdsRef.current.add(id);
    }, []);

    const value = useMemo<RaurusContextValue>(
        () => ({
            baseUrl,
            isEditing,
            isAuthenticated: !!authToken,
            selectedPlaceholderId,
            placeholderIds: [...placeholderIdsRef.current],
            login,
            logout,
            enterEditMode,
            exitEditMode,
            selectPlaceholder,
            registerPlaceholder,
        }),
        [
            baseUrl,
            isEditing,
            authToken,
            selectedPlaceholderId,
            login,
            logout,
            enterEditMode,
            exitEditMode,
            selectPlaceholder,
            registerPlaceholder,
        ]
    );

    return <RaurusContext.Provider value={value}>{children}</RaurusContext.Provider>;
}
