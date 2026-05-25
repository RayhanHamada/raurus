import type { IPermissionAdapter, IPermissionFactory } from "@raurus/core";

export interface BasicPermissionsOptions extends IPermissionAdapter {}

export const basicPermissions: IPermissionFactory<BasicPermissionsOptions> = (
    options
) => ({
    canEdit(ctx) {
        return Promise.resolve(options.canEdit(ctx));
    },
});
