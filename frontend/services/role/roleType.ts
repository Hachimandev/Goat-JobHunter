import type { IBackendRes, IModelPaginate } from "@/types/api";
import type { Role } from "@/types/model";

// Create & Update
export type CreateRoleRequest = {
  name: string;
  description?: string;
};

export type UpdateRoleRequest = Role;

// Fetch with Pagination
export type FetchRolesRequest = {
  page?: number;
  size?: number;
  sortBy?: string;
  keyword?: string;
  active?: boolean;
};

// Response Types
export type RoleMutationResponse = IBackendRes<Role>;

export type FetchRolesResponse = IBackendRes<IModelPaginate<Role>>;

export type FetchRoleByIdResponse = IBackendRes<Role>;