import type { PermissionAdapter, PermissionContext } from "@raurus/core";

export interface BasicPermissionsOptions {
    canEdit(ctx?: PermissionContext): Promise<boolean> | boolean;
}

export const basicPermissions = (
    options: BasicPermissionsOptions
): PermissionAdapter => ({
    canEdit(ctx?: PermissionContext): Promise<boolean> {
        return Promise.resolve(options.canEdit(ctx));
    },
});
