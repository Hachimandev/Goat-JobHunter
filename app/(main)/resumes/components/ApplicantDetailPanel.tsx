'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Resume } from '@/types/model';

type ApplicantDetailPanelProps = {
  selectedResume: Resume | null;
  isLoading?: boolean;
};

export const ApplicantDetailPanel = ({ selectedResume, isLoading }: ApplicantDetailPanelProps) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (!selectedResume) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="size-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chọn một hồ sơ</h3>
          <p className="text-sm text-gray-500">Chọn một hồ sơ ứng viên để xem thông tin chi tiết</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Thông tin ứng viên</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Applicant ID</h3>
          <p className="text-lg font-semibold text-gray-900">{selectedResume.applicant?.accountId || 'N/A'}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tiêu đề hồ sơ</h3>
            <p className="text-base text-gray-900">{selectedResume.title}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tên file</h3>
            <p className="text-base text-gray-900">{selectedResume.fileName}</p>
          </div>

          {selectedResume.applicant?.fullName && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Họ và tên</h3>
              <p className="text-base text-gray-900">{selectedResume.applicant.fullName}</p>
            </div>
          )}

          {selectedResume.applicant?.email && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
              <p className="text-base text-gray-900">{selectedResume.applicant.email}</p>
            </div>
          )}

          {selectedResume.applicant?.phone && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Số điện thoại</h3>
              <p className="text-base text-gray-900">{selectedResume.applicant.phone}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
