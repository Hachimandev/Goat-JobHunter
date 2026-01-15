import type { IBackendRes, IModelPaginate } from '@/types/api';
import { Review } from '@/types/model';
import { CompanyIdRequest } from '../company/companyType';

export type ReviewsByCompanyRequest = {
  companyName: string;
  page?: number;
  size?: number;
};

export type CreateReviewRequest = {
  companyId: number;
  rating: number;
  comment: string;
  workEnvironmentRating: number;
  compensationBenefitsRating: number;
  managementLeadershipRating: number;
  careerDevelopmentRating: number;
  workLifeBalanceRating: number;
  recommended: boolean;
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

