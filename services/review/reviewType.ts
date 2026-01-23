import type { IBackendRes, IModelPaginate } from '@/types/api';
import { Review } from '@/types/model';
import { CompanyIdRequest } from '../company/companyType';

export type ReviewsByCompanyRequest = {
  companyName: string;
  page?: number;
  size?: number;
};

export type CreateReviewRequest = {
  rating: {
    overall: number;
    salaryBenefits: number;
    trainingLearning: number;
    managementCaresAboutMe: number;
    cultureFun: number;
    officeWorkspace: number;
  };
  summary: string;
  experience: string;
  suggestion: string;
  recommended: boolean;
  companyId: number;
};

export type ReviewsByCompanyResponse = IBackendRes<IModelPaginate<Review>>;

export type LatestReviewsResponse = IBackendRes<Review[]>;

export type CountReviewsByCompanyResponse = IBackendRes<Record<number, number>>;

export type AverageRatingsByCompanyResponse = IBackendRes<Record<number, number>>;

export type CountAllReviewsResponse = IBackendRes<number>;

export type RatingSummaryByCompanyResponse = IBackendRes<{
  workEnvironment: number;
  compensationBenefits: number;
  managementLeadership: number;
  careerDevelopment: number;
  workLifeBalance: number;
  overall: number;
}>;

export type CalculateRecommendedPercentageByCompanyResponse = IBackendRes<number>;

export type CreateReviewResponse = IBackendRes<Review>;

