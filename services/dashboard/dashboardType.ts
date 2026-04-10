import type { IBackendRes } from '@/types/api';

// Base Request Types
export type DateRangeRequest = {
  startDate?: string;
  endDate?: string;
  status?: string;
};

export type YearRequest = {
  year: number;
};

export type YearMonthRequest = {
  year: number;
  month: number;
};

export type StatisticsApplicationByYearRequest = {
  year?: number;
  status?: string;
  recruiterId?: number;
};

// Response Data Types
export type UserStatistics = {
  applicants: number;
  recruiters: number;
  admins: number;
};

export type TotalStatistics = {
  users: UserStatistics;
  totalJobs: number;
  totalBlogs: number;
  totalApplications: number;
};

export type ApplicationsByStatus = {
  [key: string]: {
    [month: number]: number;
  };
};

export type TopBlog = {
  id: number;
  content?: string;
  contentPreview?: string;
  totalLikes: number;
  totalComments: number;
  totalReads: number;
};

// Response Types
export type StatisticsUserResponse = IBackendRes<Record<string, number>>;

export type StatisticsJobResponse = IBackendRes<Record<string, number>>;

export type StatisticsApplicationResponse = IBackendRes<Record<string, number>>;

export type StatisticsApplicationByYearResponse = IBackendRes<Record<number, number>>;

export type TotalStatisticsResponse = IBackendRes<TotalStatistics>;

export type ApplicationsByStatusResponse = IBackendRes<ApplicationsByStatus>;

export type TopBlogsResponse = IBackendRes<TopBlog[]>;
