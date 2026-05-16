import { Education, Gender, Level } from "./enum";
import { Address, Contact, Skill } from "./model";

export type CreateBlogDto = {
  content: string;
  files?: File[];
};

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
  // dateOfBirth?: string;
  // applicant?: ApplicantResponse;
  // recruiter?: RecruiterResponse;
};

export type RecruiterResponse = UserResponse & {
  position: string;
  company: {
    companyId: number;
    name: string;
  };
};

export type ApplicantResponse = UserResponse & {
  availableStatus: boolean;
  education: Education;
  level: Level;
  // experience?: number;
  // skills?: Skill[];
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
