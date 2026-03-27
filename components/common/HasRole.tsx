import { User } from '@/types/model';
import { ROLE } from '@/constants/constant';
import { ReactNode } from 'react';
import { ApplicantResponse, CompanyResponse, LoginResponseDto, RecruiterResponse, UserResponse } from '@/types/dto';

interface HasRoleProps {
  user: User | LoginResponseDto | UserResponse | ApplicantResponse | RecruiterResponse | CompanyResponse | null;
  role: ROLE;
  children: ReactNode | ReactNode[];
}

const HasRole = ({ user, role, children }: HasRoleProps) => {
  if (!user || user.role.name !== role) {
    return null;
  }

  return children;
};

export const HasAdmin = (props: Omit<HasRoleProps, 'role'>) => <HasRole {...props} role={ROLE.SUPER_ADMIN} />;

export const HasCompany = (props: Omit<HasRoleProps, 'role'>) => <HasRole {...props} role={ROLE.COMPANY} />;

export const HasRecruiter = (props: Omit<HasRoleProps, 'role'>) => <HasRole {...props} role={ROLE.HR} />;

export const HasApplicant = (props: Omit<HasRoleProps, 'role'>) => <HasRole {...props} role={ROLE.APPLICANT} />;
