import type { IBackendRes, IModelPaginate } from "@/types/api";
import type { Skill } from "@/types/model";

export type SkillNameRequest = {
  name: string;
};

export type UpdateSkillRequest = SkillNameRequest & {
  skillId: string;
};

// Fetch with Pagination
export type FetchSkillsRequest = {
  page?: number;
  size?: number;
  name?: string;
};

// Response Types
export type SkillMutationResponse = IBackendRes<Skill>;

export type FetchSkillsResponse = IBackendRes<IModelPaginate<Skill>>;