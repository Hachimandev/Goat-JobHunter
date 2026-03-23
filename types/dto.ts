import { Address, Contact, Role } from '@/types/model';
import { Education, Gender, Level } from '@/types/enum';

export type FetchCurrentRecruiterDto = {
  userId: number;
  addresses: Address[];
  contact: Contact;
  username: string;
  fullName: string;
  avatar: string;
  gender: Gender;
  dob: Date;
  enabled: boolean;
  role: { roleId: number; name: string };
  createdAt: Date;
  updatedAt: Date;
  description: string;
  website: string;
};

export type FetchCurrentApplicantDto = {
  userId: number;
  addresses: Address[];
  contact: Contact;
  username: string;
  fullName: string;
  avatar: string;
  gender: Gender;
  dob: string;
  enabled: boolean;
  role: { roleId: number; name: string };
  createdAt: string;
  updatedAt: string;
  availableStatus: boolean;
  education: Education;
  level: Level;
};

export type LoginResponseDto = {
  accountId: number;
  email: string;
  phone: string;
  addresses: Address[];
  dob: string;
  gender: Gender;
  fullName: string;
  username: string;
  avatar: string;
  type: string;
  enabled: boolean;
  role: Role;

  company?: {
    companyId: number;
    name: string;
  };
};

export type UserResponse = {
  accountId: number;
  username: string;
  email: string;
  phone: string;
  addresses: Address[];
  fullName: string;
  avatar: string;
  gender: Gender;
  dob: string;
  enabled: boolean;
  coverPhoto: string;
  headline: string;
  bio: string;
  role: {
    roleId: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type ApplicantResponse = UserResponse & {
  availableStatus: boolean;
  education: Education;
  level: Level;
};

export type RecruiterResponse = UserResponse & {
  position: string;
  company: {
    companyId: number;
    name: string;
  };
};

export type CompanyResponse = {
  accountId: number;
  email: string;
  name: string;
  description: string;
  logo: string;
  coverPhoto: string;
  website: string;
  phone: string;
  size: string;
  verified: boolean;
  country: string;
  industry: string;
  workingDays: string;
  overtimePolicy: string;

  role: {
    roleId: number;
    name: string;
  };

  addresses: {
    addressId: number;
    province: string;
    fullAddress: string;
  }[];

  awards: {
    companyAwardId: number;
    type: string;
    year: number;
  }[];

  createdAt: string;
  updatedAt: string;
};

export type CreateBlogDto = {
  content: string;
  files?: File[];
};

export type ApplicantUpdateDto = {
  accountId: number;
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  addresses?: {
    addressId?: number;
    province: string;
    fullAddress: string;
  }[];
  dob?: string;
  gender?: Gender;
  education?: Education;
  level?: Level;
  avatar?: string;
  availableStatus?: boolean;
};

export type RecruiterUpdateDto = {
  accountId: number;
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  addresses?: {
    addressId?: number;
    province: string;
    fullAddress: string;
  }[];
  dob?: string;
  gender?: Gender;
  position?: string;
  avatar?: string;
};
