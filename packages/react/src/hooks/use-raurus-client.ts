import { useContext } from "react";

import { RaurusContext } from "@/context";

export function useRaurusClient() {
    const { baseUrl: _baseUrl } = useContext(RaurusContext);

    return {};
}
