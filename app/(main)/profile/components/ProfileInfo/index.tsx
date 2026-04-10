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
import { Switch } from '@/components/ui/switch';
import { Visibility } from '@/types/enum';
import { useUpdateMyVisibilityMutation } from '@/services/user/userApi';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/utils/apiError';

export default function ProfileInfo() {
  const [showModal, setShowModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);
  const [optimisticVisibility, setOptimisticVisibility] = useState<Visibility | null>(null);
  const { user } = useUser();
  const [updateMyVisibility, { isLoading: isUpdatingVisibility }] = useUpdateMyVisibilityMutation();

  if (!user) {
    return <ErrorMessage message={'Không tìm thấy thông tin người dùng.'} />;
  }

  const me = user as MeResponse;
  const isApplicant = isApplicantResponse(me);
  const isRecruiter = isRecruiterResponse(me);
  const isCompany = isCompanyResponse(me);
  const currentVisibility = (me.visibility as Visibility | undefined) ?? Visibility.PUBLIC;
  const effectiveVisibility = optimisticVisibility ?? currentVisibility;
  const isPublicVisibility = effectiveVisibility === Visibility.PUBLIC;

  const handleToggleVisibility = async (checked: boolean) => {
    const nextVisibility = checked ? Visibility.PUBLIC : Visibility.PRIVATE;

    if (nextVisibility === currentVisibility || isUpdatingVisibility) {
      return;
    }

    setOptimisticVisibility(nextVisibility);

    try {
      await updateMyVisibility({ visibility: nextVisibility }).unwrap();
      toast.success(
        nextVisibility === Visibility.PUBLIC
          ? 'Tài khoản đã chuyển sang chế độ Public.'
          : 'Tài khoản đã chuyển sang chế độ Private.',
      );
      setOptimisticVisibility(null);
    } catch (error) {
      setOptimisticVisibility(null);
      toast.error(extractApiErrorMessage(error, 'Không thể cập nhật quyền riêng tư tài khoản.'));
    }
  };

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

        <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Quyền riêng tư tin nhắn</h3>
              <p className="text-sm text-muted-foreground">
                {isPublicVisibility
                  ? 'Public: Người khác có thể chủ động bắt đầu cuộc trò chuyện với bạn.'
                  : 'Private: Người khác không thể chủ động bắt đầu cuộc trò chuyện với bạn.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{isPublicVisibility ? 'Public' : 'Private'}</span>
              <Switch
                checked={isPublicVisibility}
                onCheckedChange={handleToggleVisibility}
                disabled={isUpdatingVisibility}
              />
            </div>
          </div>
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
