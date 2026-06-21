import type { NextConfig } from "next";

export function withRaurus(config: NextConfig = {}): NextConfig {
    return {
        ...config,
    };
}
