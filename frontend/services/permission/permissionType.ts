import type { IBackendRes, IModelPaginate } from "@/types/api";
import type { Permission } from "@/types/model";

// Create & Update
export type CreatePermissionRequest = {
  name: string;
  module: string;
  method: string;
  apiPath: string;
};

export type UpdatePermissionRequest = Permission;

// Fetch with Pagination
export type FetchPermissionsRequest = {
  page?: number;
  size?: number;
  name?: string;
  module?: string;
  method?: string;
};

// Response Types
export type PermissionMutationResponse = IBackendRes<Permission>;

export type FetchPermissionsResponse = IBackendRes<IModelPaginate<Permission>>;

export type FetchPermissionByIdResponse = IBackendRes<Permission>;