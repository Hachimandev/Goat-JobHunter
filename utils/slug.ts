import { ApplicantResponse, CompanyResponse, MeResponse, RecruiterResponse } from '@/types/dto';

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // space → -
    .replace(/[^\w-]+/g, '') // remove special chars
    .replace(/--+/g, '-');

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as Record<string, unknown>).data;
    if (data && typeof data === 'object' && 'message' in data) {
      return (data as Record<string, unknown>).message as string;
    }
  }
  return fallback;
};

export const isCompanyResponse = (user: MeResponse): user is CompanyResponse => user.role.name === 'COMPANY';
export const isRecruiterResponse = (user: MeResponse): user is RecruiterResponse => user.role.name === 'HR';
export const isApplicantResponse = (user: MeResponse): user is ApplicantResponse => user.role.name === 'APPLICANT';

export const normalizeWebsiteUrl = (website: string): string => {
  if (/^https?:\/\//i.test(website)) {
    return website;
  }

  return `https://${website}`;
};
