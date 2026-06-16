import { IBackendRes, IModelPaginate } from '@/types/api';
import { Review } from '@/types/model';

export type RatingDistribution = Record<number, number>;

export type RatingItem = {
    average: number;
    distribution: RatingDistribution;
};

export type ReviewsByCompanyRequest = {
    page?: number;
    size?: number;
    companyName?: string;
};

export type CountReviewsByCompanyResponse = IBackendRes<Record<number, number>>;

export type AverageRatingsByCompanyResponse = IBackendRes<Record<number, number>>;

export type ReviewsByCompanyResponse = IBackendRes<IModelPaginate<Review>>;

export type LatestReviewsResponse = IBackendRes<Review[]>;

export type CountAllReviewsResponse = IBackendRes<number>;

export type CalculateRecommendedPercentageByCompanyResponse = IBackendRes<number>;

export type RatingSummaryByCompanyResponse = IBackendRes<{
    ratings: Record<string, RatingItem>;
}>;

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

export type CreateReviewResponse = IBackendRes<Review>;
