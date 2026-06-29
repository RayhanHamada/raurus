import { useContext } from "react";

import { RaurusContext } from "@/context";

export function useRaurus() {
    const ctx = useContext(RaurusContext);

    if (!ctx) {
        throw new Error(`useRaurus must be used within RaurusProvider`);
    }

    return ctx;
}
