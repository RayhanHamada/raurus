import type {
    IPermissionAdapterFactoryBaseOption,
    IPermissionContext,
} from "@raurus/core";

export interface BasicPermissionOptions extends IPermissionAdapterFactoryBaseOption {}
export type BasicPermissionContext = IPermissionContext<unknown, unknown>;
