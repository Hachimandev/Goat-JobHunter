import type { IBackendRes, IModelPaginate } from '@/types/api';
import type { Skill, Subscriber } from '@/types/model';

// Create & Update
export type CreateSubscriberRequest = {
  skillIds: number[];
};

export type UpdateSubscriberRequest = {
  subscriberId: number;
  skillIds?: number[];
};

// Fetch with Pagination
export type FetchSubscribersRequest = {
  page?: number;
  size?: number;
  sortBy?: string;
  keyword?: string;
  email?: string;
};

// Response Types
export type SubscriberMutationResponse = IBackendRes<Subscriber>;

export type FetchSubscribersResponse = IBackendRes<IModelPaginate<Subscriber>>;

export type FetchSubscriberByIdResponse = IBackendRes<Subscriber>;

export type GetSubscriberSkillsResponse = IBackendRes<{
  subscriberId: number;
  email: string;
  name: string;
  skills: Skill[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}>;
