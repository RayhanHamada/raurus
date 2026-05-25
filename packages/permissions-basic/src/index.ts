import type { IPermissionAdapterFactory } from "@raurus/core";

import type { BasicPermissionContext, BasicPermissionOptions } from "./types";

export const basicPermissions: IPermissionAdapterFactory<
    BasicPermissionOptions,
    BasicPermissionContext
> = (_options) => ({
    canEdit(_ctx) {
        return Promise.resolve(true);
    },
});
