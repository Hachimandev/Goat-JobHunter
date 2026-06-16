import type { IBackendRes, IModelPaginate } from "@/types/api";
import type { Applicant, Contact } from "@/types/model";
import { Education, Gender, Level } from "@/types/enum";
import { ApplicantResponse, FetchCurrentApplicantDto } from "@/types/dto";

// Create Applicant
export type CreateApplicantRequest = {
  fullName: string;
  address: string;
  contact: Contact;
  dob: Date;
  gender: string;
  password: string;
  username: string;
  availableStatus: boolean;
  enabled: boolean;
  education?: string;
  level?: string;
  role?: { roleId: string; name: string };
  avatar?: string;
  resumeUrl?: string;
};

// Update Applicant
export type UpdateApplicantRequest = {
  accountId: number,
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dob: Date;
  gender: Gender;
  education: Education;
  level: Level;
  avatar: string;
}

export type ApplicantMutationResponse = IBackendRes<ApplicantResponse>;


export type FetchApplicantsResponse = IBackendRes<IModelPaginate<Applicant>>;


export type FetchApplicantByIdResponse = IBackendRes<FetchCurrentApplicantDto>;
