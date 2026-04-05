'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit2 } from 'lucide-react';
import { useState } from 'react';
import CompanyUserForm from '@/app/(main)/profile/components/ProfileInfo/CompanyUserForm';
import RecruiterUserForm from '@/app/(main)/profile/components/ProfileInfo/RecruiterUserForm';
import ApplicantUserForm from '@/app/(main)/profile/components/ProfileInfo/ApplicantUserForm';
import CompanyProfileInfo from '@/app/(main)/profile/components/ProfileInfo/CompanyProfileInfo';
import RecruiterProfileInfo from '@/app/(main)/profile/components/ProfileInfo/RecruiterProfileInfo';
import ApplicantProfileInfo from '@/app/(main)/profile/components/ProfileInfo/ApplicantProfileInfo';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useUser } from '@/hooks/useUser';
import { ApplicantResponse, RecruiterResponse, CompanyResponse, MeResponse } from '@/types/dto';
import { isApplicantResponse, isRecruiterResponse, isCompanyResponse } from '@/utils/slug';

export default function ProfileInfo() {
  const [showModal, setShowModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);
  const { user } = useUser();

  if (!user) {
    return <ErrorMessage message={'Không tìm thấy thông tin người dùng.'} />;
  }

  const me = user as MeResponse;
  const isApplicant = isApplicantResponse(me);
  const isRecruiter = isRecruiterResponse(me);
  const isCompany = isCompanyResponse(me);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Thông Tin Tài Khoản</h2>
          <Button
            onClick={() => {
              if (isCompany) {
                setShowCompanyModal(true);
              } else if (isRecruiter) {
                setShowRecruiterModal(true);
              } else {
                setShowModal(true);
              }
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            <Edit2 className="h-4 w-4" />
            Cập Nhật
          </Button>
        </div>

        <div className="space-y-4">
          {isApplicant && <ApplicantProfileInfo applicant={me as ApplicantResponse} />}

          {isRecruiter && <RecruiterProfileInfo recruiter={me as RecruiterResponse} />}

          {isCompany && <CompanyProfileInfo company={me as CompanyResponse} />}
        </div>
      </Card>
      {isCompany ? (
        <CompanyUserForm open={showCompanyModal} onOpenChange={setShowCompanyModal} profile={me as CompanyResponse} />
      ) : isRecruiter ? (
        <RecruiterUserForm
          open={showRecruiterModal}
          onOpenChange={setShowRecruiterModal}
          profile={me as RecruiterResponse}
        />
      ) : (
        <ApplicantUserForm open={showModal} onOpenChange={setShowModal} profile={me as ApplicantResponse} />
      )}
    </>
  );
}
