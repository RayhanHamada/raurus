"use client";

import type { FC, PropsWithChildren } from "react";

import { RaurusContext } from "@/context";

interface Props {
    config: {
        baseUrl: string;
    };
}

export const RaurusClientProvider: FC<PropsWithChildren<Props>> = ({ children, config }) => (
    <RaurusContext.Provider value={{ baseUrl: config.baseUrl }}>{children}</RaurusContext.Provider>
);
