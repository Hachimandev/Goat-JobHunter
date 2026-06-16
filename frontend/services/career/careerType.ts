import type { IBackendRes, IModelPaginate } from "@/types/api";
import type { Career } from "@/types/model";


export type CareerNameRequest = {
  name: string;
};

export type UpdateCareerRequest = CareerNameRequest & {
  careerId: string;
};

// Fetch with Pagination
export type FetchCareersRequest = {
  page?: number;
  size?: number;
  name?: string;
};

// Response Types
export type CareerMutationResponse = IBackendRes<Career>;

export type FetchCareersResponse = IBackendRes<IModelPaginate<Career>>;