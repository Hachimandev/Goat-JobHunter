import type { IBackendRes, IModelPaginate } from '@/types/api';
import { ApplicantResponse, RecruiterResponse, UserResponse } from '@/types/dto';
import type { Blog, Company, Job, Recruiter, User } from '@/types/model';
import { Visibility } from '@/types/enum';

// Create Request Types
export type CreateUserRequest = {
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
  address?: string;
  username?: string;
};

// Base Request Types
export type UserIdsRequest = {
  userIds: number[];
};

export type UpdateMyVisibilityRequest = {
  visibility: Visibility;
};

export type UserVisibilityResponse = {
  accountId: number;
  visibility: Visibility;
};

// Password Management
export type UpdatePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  rePassword: string;
};

export type ResetPasswordRequest = {
  email: string;
  newPassword: string;
};

// Saved Jobs
export type JobIdsRequest = {
  jobIds: number[];
};

// Saved Blogs
export type BlogIdsRequest = {
  blogIds: number[];
};

// Follow Recruiters
export type RecruiterIdsRequest = {
  recruiterIds: number[];
};

// Follow Companies
export type CompanyIdsRequest = {
  companyIds: number[];
};

// Fetch with Pagination
export type FetchUsersRequest = {
  page?: number;
  size?: number;
  email?: string;
  phone?: string;
  role?: string;
  enabled?: boolean;
};

// Response Types
export type UserMutationResponse = IBackendRes<User>;

export type FetchUsersResponse = IBackendRes<IModelPaginate<User>>;

export type FetchUserResponse = IBackendRes<UserResponse | RecruiterResponse | ApplicantResponse>;

export type UpdatePasswordResponse = IBackendRes<User>;

export type ResetPasswordResponse = IBackendRes<unknown>;

// Saved Jobs Responses
export type GetSavedJobsResponse = IBackendRes<IModelPaginate<Job>>;

export type SaveJobsResponse = {
  userId: number;
  savedJobs: Job[];
};

export type CheckSavedJobsResponse = IBackendRes<
  {
    jobId: number;
    result: boolean;
  }[]
>;

// Saved Blogs Responses
export type GetSavedBlogsResponse = IBackendRes<IModelPaginate<Blog>>;

export type SaveBlogsResponse = {
  userId: number;
  savedBlogs: Blog[];
};

export type CheckSavedBlogsResponse = IBackendRes<
  {
    blogId: number;
    result: boolean;
  }[]
>;

// Follow Recruiters Responses
export type GetFollowedRecruitersResponse = IBackendRes<Recruiter[]>;

export type FollowRecruitersResponse = IBackendRes<User>;

export type CheckRecruitersFollowedResponse = IBackendRes<
  {
    recruiterId: number;
    result: boolean;
  }[]
>;

// Follow Companies Responses
export type GetFollowedCompaniesResponse = IBackendRes<Company[]>;

export type FollowCompaniesResponse = IBackendRes<User>;

export type CheckCompaniesFollowedResponse = IBackendRes<
  {
    companyId: number;
    result: boolean;
  }[]
>;

export type CheckReviewedCompaniesResponse = IBackendRes<
  {
    companyId: number;
    result: boolean;
  }[]
>;

export type UpdateMyVisibilityMutationResponse = IBackendRes<UserVisibilityResponse>;
