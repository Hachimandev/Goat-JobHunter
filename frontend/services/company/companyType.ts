import type { IBackendRes, IModelPaginate } from '@/types/api';
import { CompanyResponse } from '@/types/dto';
import { CompanySize } from '@/types/enum';
import { Address, Company, Job } from '@/types/model';

export type UpdateCompanyRequest = {
  accountId: number;
  username: string;
  addresses: Address[];
  name: string;
  description: string;
  logo: File;
  coverPhoto: File;
  website: string;
  phone: string;
  size: CompanySize;
  country: string;
  industry: string;
  workingDays: string;
  overtimePolicy: string;
};

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

export type CompanyMutationResponse = IBackendRes<CompanyResponse>;

export type FetchCompaniesResponse = IBackendRes<IModelPaginate<Company>>;

export type FetchCompanyByIdResponse = IBackendRes<Company>;

export type FetchGroupedAddressesByCompanyResponse = IBackendRes<Record<string, string[]>>;

export type FetchSkillsByCompanyResponse = IBackendRes<Record<number, string>>;

export type FetchJobsByCompanyResponse = IBackendRes<Job[]>;

export type FetchAllCompanyNames = IBackendRes<string[]>;
