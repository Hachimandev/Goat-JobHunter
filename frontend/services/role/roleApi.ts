import { api } from "@/services/api";
import type {
  CreateRoleRequest,
  FetchRoleByIdResponse,
  FetchRolesRequest,
  FetchRolesResponse,
  RoleMutationResponse,
  UpdateRoleRequest
} from "./roleType";

export const roleApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createRole: builder.mutation<RoleMutationResponse, CreateRoleRequest>({
      query: (role) => ({
        url: "/roles",
        method: "POST",
        data: role
      }),
      invalidatesTags: [{ type: "Role", id: "LIST" }]
    }),

    updateRole: builder.mutation<RoleMutationResponse, UpdateRoleRequest>({
      query: (data) => ({
        url: "/roles",
        method: "PUT",
        data
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Role", id: arg.roleId },
        { type: "Role", id: "LIST" }
      ]
    }),

    activateRole: builder.mutation<RoleMutationResponse, number>({
      query: (roleId) => ({
        url: `/roles/${roleId}/activate`,
        method: "PUT"
      }),
      invalidatesTags: (_, __, roleId) => [
        { type: "Role", id: roleId },
        { type: "Role", id: "LIST" }
      ]
    }),

    deactivateRole: builder.mutation<RoleMutationResponse, number>({
      query: (roleId) => ({
        url: `/roles/${roleId}/deactivate`,
        method: "PUT"
      }),
      invalidatesTags: (_, __, roleId) => [
        { type: "Role", id: roleId },
        { type: "Role", id: "LIST" }
      ]
    }),

    deleteRole: builder.mutation<RoleMutationResponse, number>({
      query: (roleId) => ({
        url: `/roles/${roleId}`,
        method: "DELETE"
      }),
      invalidatesTags: (_, __, roleId) => [
        { type: "Role", id: roleId },
        { type: "Role", id: "LIST" }
      ]
    }),

    fetchRoles: builder.query<FetchRolesResponse, FetchRolesRequest>({
      query: (params) => ({
        url: "/roles",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.result.map((role) => ({
                type: "Role" as const,
                id: role.roleId
              })),
              { type: "Role", id: "LIST" }
            ]
          : [{ type: "Role", id: "LIST" }]
    }),

    fetchRoleById: builder.query<FetchRoleByIdResponse, number>({
      query: (roleId) => ({
        url: `/roles/${roleId}`,
        method: "GET"
      }),
      providesTags: (_, __, roleId) => [{ type: "Role", id: roleId }]
    })
  })
});

export const {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useActivateRoleMutation,
  useDeactivateRoleMutation,
  useDeleteRoleMutation,
  useFetchRolesQuery,
  useFetchRoleByIdQuery
} = roleApi;