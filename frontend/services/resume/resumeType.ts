import { IBackendRes, IModelPaginate } from '@/types/api';
import { Resume } from '@/types/model';

export type UpdateResumeRequest = {
  resumeId: number;
  title: string;
};

export type FetchResumesRequest = {
  page?: number;
  size?: number;
};

export type FetchResumesResponse = IBackendRes<IModelPaginate<Resume>>;
export type ResumeMutationResponse = IBackendRes<Resume>;
export type ResumeStatusResponse = IBackendRes<{ resumeId: number; result: boolean }>;
