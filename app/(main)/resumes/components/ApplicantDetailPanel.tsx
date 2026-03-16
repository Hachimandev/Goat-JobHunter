'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ApplicantResponse, UserResponse } from '@/types/dto';
import { Resume } from '@/types/model';
import { formatDate } from '@/utils/formatDate';
import {
  BookOpenCheck,
  CalendarDays,
  FileText,
  Fingerprint,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  UserRound,
  VenusAndMars,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

type ApplicantDetailUser = Pick<
  UserResponse,
  | 'accountId'
  | 'username'
  | 'email'
  | 'phone'
  | 'fullName'
  | 'avatar'
  | 'gender'
  | 'dob'
  | 'enabled'
  | 'coverPhoto'
  | 'headline'
  | 'bio'
  | 'role'
  | 'addresses'
  | 'createdAt'
> &
  Partial<Pick<ApplicantResponse, 'availableStatus' | 'education' | 'level'>>;

type ApplicantDetailPanelProps = {
  selectedResume: Resume | null;
  getUserById: (userId: number) => Promise<ApplicantDetailUser | undefined>;
  handleSendInvitationEmail: (applicantIds: number[], jobId: number) => void;
  isLoading?: boolean;
  isFetchingUserById?: boolean;
  isFetchingUserByIdError?: boolean;
  job: string;
};

const DEFAULT_TEXT = 'Chưa cập nhật';

const getText = (value?: string | number | null) =>
  value === undefined || value === null || value === '' ? DEFAULT_TEXT : String(value);

const getDateText = (value?: string | null) => (value ? formatDate(value) : DEFAULT_TEXT);

const getInitials = (name?: string | null) => {
  if (!name) return 'Ứng viên';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const SectionTitle = ({ icon, title }: { icon: ReactNode; title: string }) => (
  <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-slate-700">
    <span className="text-sky-600">{icon}</span>
    {title}
  </div>
);

export const ApplicantDetailPanel = ({
  selectedResume,
  getUserById,
  isLoading,
  isFetchingUserById,
  isFetchingUserByIdError,
  job,
  handleSendInvitationEmail,
}: ApplicantDetailPanelProps) => {
  const [userDetail, setUserDetail] = useState<ApplicantDetailUser | null>(null);

  useEffect(() => {
    const applicantId = selectedResume?.applicant?.accountId;

    if (!applicantId) return;

    let mounted = true;

    const fetchUser = async () => {
      const user = await getUserById(applicantId);
      if (mounted && user) setUserDetail(user);
    };

    void fetchUser();

    return () => {
      mounted = false;
    };
  }, [getUserById, selectedResume?.applicant?.accountId]);

  const user = userDetail?.accountId === selectedResume?.applicant?.accountId ? userDetail : null;
  const addresses = user?.addresses ?? [];
  const availability =
    user?.availableStatus === undefined ? DEFAULT_TEXT : user.availableStatus ? 'Sẵn sàng nhận việc' : 'Chưa sẵn sàng';
  const levelText = getText(user?.level ?? selectedResume?.applicant?.level);
  const educationText = getText(user?.education ?? selectedResume?.applicant?.education);
  const bioText = getText(user?.bio);
  const emailForContact = user?.email ?? selectedResume?.applicant?.email;
  const avatar = user?.avatar || selectedResume?.applicant?.avatar;
  const cover = user?.coverPhoto || selectedResume?.applicant?.coverPhoto;
  const name = user?.fullName || selectedResume?.applicant?.fullName;

  const handleSendEmail = () => {
    if (!userDetail || !job) return;
    handleSendInvitationEmail([userDetail.accountId], Number(job));
  };

  if (isLoading || isFetchingUserById) {
    return (
      <Card className="h-full rounded-2xl shadow-lg">
        <CardHeader className="p-6">
          <Skeleton className="h-28 w-full rounded-xl" />
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!selectedResume) {
    return (
      <Card className="flex h-full items-center justify-center rounded-2xl shadow-md">
        <CardContent className="py-12 text-center">
          <UserRound className="mx-auto mb-3 size-10 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900">Chọn một hồ sơ</h3>
          <p className="text-sm text-slate-500">Chọn ứng viên để xem thông tin chi tiết.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-2xl shadow-lg gap-0 py-0">
      <CardHeader className="p-0">
        <div
          className="relative p-6"
          style={{
            backgroundImage: cover
              ? `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.25)), url(${cover})`
              : 'linear-gradient(135deg,#0ea5e9,#10b981)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-end gap-5 text-white">
            <Avatar className="size-24 border-4 border-white shadow-lg">
              <AvatarImage src={avatar || undefined} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-2xl font-bold">{getText(name)}</CardTitle>
              <p className="text-sm text-white/90">{getText(user?.headline)}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/80">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {addresses[0]?.province ?? DEFAULT_TEXT}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Badge className="bg-emerald-500 text-white">
                  <UserCheck className="mr-1 size-3" />
                  {availability}
                </Badge>
                {Number(job) !== -1 && emailForContact && (
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => handleSendEmail()}
                    style={{ animation: 'mailButtonReveal 360ms cubic-bezier(0.2, 0.9, 0.2, 1) both' }}
                    className="group h-9 w-9 rounded-full border-2 border-sky-100/90 bg-linear-to-br from-sky-400 via-blue-500 to-cyan-500 p-0 text-white shadow-[0_10px_26px_rgba(14,116,244,0.55)] transition-all duration-200 hover:scale-105 hover:brightness-105 hover:shadow-[0_14px_30px_rgba(14,116,244,0.72)] focus-visible:ring-2 focus-visible:ring-sky-100"
                  >
                    <span className="flex size-full items-center justify-center">
                      <Mail className="size-4 drop-shadow-[0_1px_0_rgba(255,255,255,0.45)]" />
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-5 overflow-y-auto p-5">
        {isFetchingUserByIdError && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">Không thể tải đầy đủ thông tin ứng viên.</div>
        )}

        <section className="space-y-3">
          <SectionTitle icon={<Fingerprint size={16} />} title="Thông tin cơ bản" />
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="shrink-0 text-sky-600">
                  <UserRound size={16} />
                </span>
                <span className="font-medium">Username</span>
              </div>
              <p className="text-sm font-semibold leading-6 wrap-break-word text-slate-900 sm:text-right">
                {getText(user?.username)}
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="shrink-0 text-sky-600">
                  <VenusAndMars size={16} />
                </span>
                <span className="font-medium">Giới tính</span>
              </div>
              <p className="text-sm font-semibold leading-6 wrap-break-word text-slate-900 sm:text-right">
                {getText(user?.gender)}
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="shrink-0 text-sky-600">
                  <CalendarDays size={16} />
                </span>
                <span className="font-medium">Ngày sinh</span>
              </div>
              <p className="text-sm font-semibold leading-6 wrap-break-word text-slate-900 sm:text-right">
                {getDateText(user?.dob)}
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="shrink-0 text-sky-600">
                  <CalendarDays size={16} />
                </span>
                <span className="font-medium">Ngày tham gia</span>
              </div>
              <p className="text-sm font-semibold leading-6 wrap-break-word text-slate-900 sm:text-right">
                {getDateText(user?.createdAt)}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle icon={<Mail size={16} />} title="Thông tin liên hệ" />
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="shrink-0 text-sky-600">
                  <Mail size={16} />
                </span>
                <span className="font-medium">Email</span>
              </div>
              <p className="text-sm font-semibold leading-6 wrap-break-word text-slate-900 sm:text-right">
                {getText(user?.email)}
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="shrink-0 text-sky-600">
                  <Phone size={16} />
                </span>
                <span className="font-medium">Điện thoại</span>
              </div>
              <p className="text-sm font-semibold leading-6 wrap-break-word text-slate-900 sm:text-right">
                {getText(user?.phone)}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle icon={<BookOpenCheck size={16} />} title="Năng lực" />
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="shrink-0 text-sky-600">
                  <BookOpenCheck size={16} />
                </span>
                <span className="font-medium">Học vấn</span>
              </div>
              <p className="text-sm font-semibold leading-6 wrap-break-word text-slate-900 sm:text-right">
                {educationText}
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="shrink-0 text-sky-600">
                  <BookOpenCheck size={16} />
                </span>
                <span className="font-medium">Cấp bậc</span>
              </div>
              <p className="text-sm font-semibold leading-6 wrap-break-word text-slate-900 sm:text-right">
                {levelText}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle icon={<FileText size={16} />} title="Giới thiệu" />
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-600">
            {bioText}
          </div>
        </section>
      </CardContent>

      <style jsx>{`
        @keyframes mailButtonReveal {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.86);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </Card>
  );
};
