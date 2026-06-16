import { api } from "@/services/api";
import { buildSpringQuery } from "@/utils/buildSpringQuery";
import type {
  CreatePermissionRequest,
  FetchPermissionByIdResponse,
  FetchPermissionsRequest,
  FetchPermissionsResponse,
  PermissionMutationResponse,
  UpdatePermissionRequest
} from "./permissionType";

export const permissionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPermission: builder.mutation<
      PermissionMutationResponse,
      CreatePermissionRequest
    >({
      query: (permission) => ({
        url: "/permissions",
        method: "POST",
        data: permission
      }),
      invalidatesTags: [{ type: "Permission", id: "LIST" }]
    }),

    updatePermission: builder.mutation<
      PermissionMutationResponse,
      UpdatePermissionRequest
    >({
      query: (data) => ({
        url: "/permissions",
        method: "PUT",
        data
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Permission", id: arg.permissionId },
        { type: "Permission", id: "LIST" }
      ]
    }),

    deletePermission: builder.mutation<
      PermissionMutationResponse,
      number
    >({
      query: (permissionId) => ({
        url: `/permissions/${permissionId}`,
        method: "DELETE"
      }),
      invalidatesTags: (_, __, permissionId) => [
        { type: "Permission", id: permissionId },
        { type: "Permission", id: "LIST" }
      ]
    }),

    fetchPermissions: builder.query<
      FetchPermissionsResponse,
      FetchPermissionsRequest
    >({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ["module", "name", "method"],
          textSearchFields: ["module", "name"],
          defaultSort: "createdAt,desc",
          sortableFields: ["createdAt", "updatedAt"]
        });

        return {
          url: "/permissions",
          method: "GET",
          params: queryParams
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.result.map((permission) => ({
                type: "Permission" as const,
                id: permission.permissionId
              })),
              { type: "Permission", id: "LIST" }
            ]
          : [{ type: "Permission", id: "LIST" }]
    }),

    fetchPermissionById: builder.query<
      FetchPermissionByIdResponse,
      number
    >({
      query: (permissionId) => ({
        url: `/permissions/${permissionId}`,
        method: "GET"
      }),
      providesTags: (_, __, permissionId) => [
        { type: "Permission", id: permissionId }
      ]
    })
  })
});

export const {
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useFetchPermissionsQuery,
  useFetchPermissionByIdQuery
} = permissionApi;