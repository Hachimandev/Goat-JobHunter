import type { IBackendRes, IModelPaginate } from "@/types/api";
import type { Contact, Recruiter } from "@/types/model";
import { Gender } from "@/types/enum";
import { FetchCurrentRecruiterDto, RecruiterResponse } from "@/types/dto";

// Create & Update
export type CreateRecruiterRequest = {
  fullName: string;
  password: string;
  username: string;
  contact: Contact;
  address: string;
  enabled: boolean;
  description?: string;
  avatar?: string;
  role?: { roleId: string; name: string };
  website?: string;
};

export type UpdateRecruiterRequest = {
  accountId: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dob: Date;
  gender: Gender;
  avatar: string;
  position: string;
};

// Fetch with Pagination
export type FetchRecruitersRequest = {
  page?: number;
  size?: number;
  sortBy?: string;
  fullName?: string;
  address?: string;
  enabled?: boolean;
};

// Response Types
export type RecruiterMutationResponse = IBackendRes<RecruiterResponse>;

export type FetchRecruitersResponse = IBackendRes<IModelPaginate<Recruiter>>;

export type FetchRecruiterByIdResponse = IBackendRes<Recruiter>;

export type FetchCurrentRecruiterResponse = IBackendRes<FetchCurrentRecruiterDto>;