import type { RuntimeAuthAdapterBaseConfig, RuntimeAuthAdapterFactory } from "@raurus/core";

interface SimplePasswordAuthConfig extends RuntimeAuthAdapterBaseConfig {
    password: string;
}

export const createSimplePasswordAuth: RuntimeAuthAdapterFactory<
    SimplePasswordAuthConfig,
    "simple-password-auth-adapter"
> = (config) => {
    if (!config?.password) {
        throw new Error("Password is required for simple password auth adapter");
    }

    const expectedPassword = config.password;
    const tokens = new Map<string, number>();

    return {
        id: "simple-password-auth-adapter",
        apiVersion: "1",

        async checkConnection() {
            return { ok: true, data: null };
        },

        async authenticate(password) {
            if (password !== expectedPassword) {
                return {
                    ok: false,
                    error: new Error("Invalid password"),
                    code: "PERMISSION" as const,
                };
            }

            const token = crypto.randomUUID();
            tokens.set(token, Date.now());

            return { ok: true, data: { token } };
        },

        async validateToken(token) {
            const exists = tokens.has(token);
            return { ok: true, data: { valid: exists } };
        },
    };
};
