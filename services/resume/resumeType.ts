import type { IBackendRes, IModelPaginate } from '@/types/api';

export type Resume = {
  resumeId: number;
  title: string;
  fileUrl: string;
  public: boolean;
  default: boolean;
};

export type CreateResumeRequest = FormData;

export type CreateResumeResponse = IBackendRes<Resume>;

export type FetchResumesByUserRequest = {
  page?: number;
  size?: number;
};

export type FetchResumesByUserResponse = IBackendRes<IModelPaginate<Resume>>;

export type UpdateResumeTitleRequest = {
  resumeId: number;
  title: string;
};

export type UpdateResumeTitleResponse = IBackendRes<Resume>;

export type DeleteResumeRequest = {
  resumeId: number;
};
