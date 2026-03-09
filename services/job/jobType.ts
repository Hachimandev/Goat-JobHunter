import type { IBackendRes, IModelPaginate } from '@/types/api';
import type { Applicant, Job } from '@/types/model';
import { JobActionType } from '@/types/enum';

export type JobIdsRequest = {
    jobIds: number[];
};

export type ToggleJobEnabledRequest = JobIdsRequest & {
    reason?: string;
    mode: JobActionType;
};

// Base Job Content
type JobContent = {
    title: string;
    location: string;
    salary: number;
    quantity: number;
    description: string;
    level: string;
    startDate: string;
    endDate: string;
    active: boolean;
    workingType: string;
    careerId: number;
    skillIds: number[];
};

// Create & Update
export type CreateJobRequest = JobContent & {
    recruiterId: number;
};

export type UpdateJobRequest = Partial<JobContent> & {
    jobId: string;
};

// Fetch with Pagination
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
    companyId?: number;
};

export type FetchJobByRecruiterRequest = {
    recruiterId: number;
} & Omit<FetchJobsRequest, 'active'>;

export type FetchSuitableApplicantsRequest = {
    jobId?: number;
    page?: number;
    size?: number;
    fullName?: string;
    email?: string;
};

// Response Types
export type JobMutationResponse = IBackendRes<Job>;

export type FetchJobsResponse = IBackendRes<IModelPaginate<Job>>;

export type FetchJobByIdResponse = IBackendRes<Job>;

export type ToggleJobActiveResponse = IBackendRes<
    {
        jobId: number;
        active: boolean;
        status: 'success' | 'fail';
        message: string;
    }[]
>;

export type ToggleJobEnabledResponse = IBackendRes<{ jobId: number; enabled: boolean }[]>;

export type JobApplicationCountResponse = IBackendRes<
    {
        jobId: number;
        applications: number;
    }[]
>;

export type FetchSuitableApplicantsResponse = IBackendRes<IModelPaginate<Applicant>>;

export type CountJobsByCompanyResponse = IBackendRes<Record<number, number>>;
