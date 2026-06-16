import { api } from "@/services/api";
import { buildSpringQuery } from "@/utils/buildSpringQuery";
import type {
  FetchSkillsRequest,
  FetchSkillsResponse,
  SkillMutationResponse,
  SkillNameRequest,
  UpdateSkillRequest
} from "./skillType";

export const skillApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createSkill: builder.mutation<SkillMutationResponse, SkillNameRequest>({
      query: ({ name }) => ({
        url: "/skills",
        method: "POST",
        data: { name }
      }),
      invalidatesTags: [
        { type: "Skill", id: "LIST" },
      ]
    }),

    updateSkill: builder.mutation<SkillMutationResponse, UpdateSkillRequest>({
      query: ({ skillId, name }) => ({
        url: "/skills",
        method: "PUT",
        data: { skillId, name }
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Skill", id: arg.skillId },
        { type: "Skill", id: "LIST" },
      ]
    }),

    deleteSkill: builder.mutation<SkillMutationResponse, number>({
      query: (skillId) => ({
        url: `/skills/${skillId}`,
        method: "DELETE"
      }),
      invalidatesTags: (_, __, skillId) => [
        { type: "Skill", id: skillId },
        { type: "Skill", id: "LIST" },
      ]
    }),

    getSkills: builder.query<FetchSkillsResponse, FetchSkillsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ["name"],
          textSearchFields: ["name"],
          nestedArrayFields: {},
          defaultSort: "name,asc"
        });
        return {
          url: "/skills",
          method: "GET",
          params: queryParams
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.result.map((skill) => ({
              type: "Skill" as const,
              id: skill.skillId
            })),
            { type: "Skill", id: "LIST" }
          ]
          : [{ type: "Skill", id: "LIST" }]
    }),

    getAllSkills: builder.query<FetchSkillsResponse, FetchSkillsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ["name"],
          textSearchFields: ["name"],
          nestedArrayFields: {},
          defaultSort: "name,asc"
        });
        return {
          url: "/skills/all",
          method: "GET",
          params: queryParams
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.result.map((skill) => ({
              type: "Skill" as const,
              id: skill.skillId
            })),
            { type: "Skill", id: "LIST" }
          ]
          : [{ type: "Skill", id: "LIST" }]
    })
  })
});

export const {
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
  useGetSkillsQuery,
  useGetAllSkillsQuery
} = skillApi;
