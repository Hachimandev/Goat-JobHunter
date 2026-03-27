import type { IBackendRes, IModelPaginate } from '@/types/api';
import type { Application } from '@/types/model';

export type CreateApplicationRequest = {
  email: string;
  coverLetter: string;
  jobId: number;
  resumeId: number;
};

export type ApplicationMutationResponse = IBackendRes<Application>;

export type FetchApplicationsRequest = {
  page?: number;
  size?: number;
};

export type FetchApplicationsResponse = IBackendRes<IModelPaginate<Application>>;

export type CountApplicationsRequest = {
  jobId: number;
};

export type CountApplicationsResponse = IBackendRes<{ submittedApplications: number }>;
