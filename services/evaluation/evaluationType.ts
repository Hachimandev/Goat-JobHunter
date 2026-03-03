import { IBackendRes, IModelPaginate } from '@/types/api';
import { ResumeEvaluation } from '@/types/model';

export type FetchEvaluationRequest = {
  page?: number;
  size?: number;
  sortBy?: string;
  resumeId: string;
};

export type EvaluateResumeResponse = IBackendRes<ResumeEvaluation>;

export type FetchEvaluateResumeResponse = IBackendRes<IModelPaginate<ResumeEvaluation>>;
