import type { IBackendRes, IModelPaginate } from '@/types/api';
import { Company, Job } from '@/types/model';

export type CompanyIdRequest = number;

export type FetchCompaniesRequest = {
  page?: number;
  size?: number;
  sortBy?: string;
  name?: string;
  addresses?: string[];
  enabled?: boolean;
  verified?: boolean;
};

export type FetchJobsByCompanyRequest = {
  companyId: number;
};

export type CompanyMutationResponse = IBackendRes<Company>;

export type FetchCompaniesResponse = IBackendRes<IModelPaginate<Company>>;

export type FetchCompanyByIdResponse = IBackendRes<Company>;

export type FetchGroupedAddressesByCompanyResponse = IBackendRes<Record<string, string[]>>;

export type FetchSkillsByCompanyResponse = IBackendRes<Record<number, string>>;

export type FetchJobsByCompanyResponse = IBackendRes<Job[]>;

export type FetchAllCompanyNames = IBackendRes<string[]>;

