import { CompanySize, Level, WorkingType } from './enum';

export type Address = {
  addressId: number;
  province: string;
  fullAddress: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type Account = {
  accountId: number;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  enabled: boolean;
  addresses: Address[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Company = Account & {
  name: string;
  description: string;
  logo: string;
  size: CompanySize;
  verified: boolean;
  country: string;
  industry: string;
  workingDays: string;
  overtimePolicy: string;
  coverPhoto?: string;
  website?: string;
  phone?: string;
};

export type Skill = {
  skillId: number;
  name: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Career = {
  careerId: number;
  name: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Job = {
  jobId: number;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  enabled: boolean;
  level: Level;
  quantity: number;
  salary: number;
  title: string;
  workingType: WorkingType;
  address: Address;
  skills: Skill[];
  career: Career;
  company: Company;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};


