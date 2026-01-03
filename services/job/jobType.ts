import type { IBackendRes, IModelPaginate } from '../../types/api';
import type { Job } from '../../types/model';

export type FetchJobsRequest = {
  page?: number;
  size?: number;
  title?: string;
  location?: string;
  level?: string | string[];
  workingType?: string | string[];
  salary?: number;
  active?: boolean;
  skills?: number[];
};

export type FetchJobsResponse = IBackendRes<IModelPaginate<Job>>;

export type JobIdRequest = string;

export type FetchJobByIdResponse = IBackendRes<Job>;


