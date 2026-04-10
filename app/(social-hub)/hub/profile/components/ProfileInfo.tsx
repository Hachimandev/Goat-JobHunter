import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';
import { ApplicantResponse, MeResponse, RecruiterResponse, UserResponse } from '@/types/dto';
import { Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { isApplicantResponse, isCompanyResponse, isRecruiterResponse, normalizeWebsiteUrl } from '@/utils/slug';
import { formatDate } from '@/utils/formatDate';

type ProfileInfoUser = MeResponse | UserResponse;

type ProfileInfoProps = {
  user?: ProfileInfoUser | null;
  hideSensitiveContact?: boolean;
};

export function ProfileInfo({ user: profileUserProp, hideSensitiveContact = false }: Readonly<ProfileInfoProps>) {
  const { user } = useUser();
  const profileUser = profileUserProp ?? user;

  if (!profileUser) return null;

  const me = profileUser as MeResponse;
  const isCompany = isCompanyResponse(me);
  const displayName = isCompany ? me.name : (me as UserResponse).fullName || me.email;
  const username = isCompany ? undefined : (me as UserResponse).username;
  const email = me.email;
  const description = isCompany ? me.description : (me as UserResponse).headline;
  const bio = isCompany ? me.overtimePolicy : (me as UserResponse).bio;
  const recruiter = isRecruiterResponse(me) ? (me as RecruiterResponse) : null;
  const applicant = isApplicantResponse(me) ? (me as ApplicantResponse) : null;

  const recruiterAddresses = recruiter?.addresses?.length
    ? recruiter.addresses.map((address) => `${address.fullAddress}, ${address.province}`).join('; ')
    : 'Chưa cập nhật';
  const applicantAddresses = applicant?.addresses?.length
    ? applicant.addresses.map((address) => `${address.fullAddress}, ${address.province}`).join('; ')
    : 'Chưa cập nhật';
  const companyAddresses = isCompany
    ? me.addresses?.length
      ? me.addresses.map((address) => `${address.fullAddress}, ${address.province}`).join('; ')
      : 'Chưa cập nhật'
    : 'Chưa cập nhật';
  const companyAwards = isCompany
    ? me.awards?.length
      ? me.awards.map((award) => `${award.type} (${award.year})`).join('; ')
      : 'Chưa cập nhật'
    : 'Chưa cập nhật';

  const infoSections: Array<{ title: string; items: Array<{ label: string; value: string }> }> = [];

  if (recruiter) {
    infoSections.push(
      {
        title: 'Thông tin cá nhân',
        items: [
          { label: 'Giới tính', value: recruiter.gender || 'Chưa cập nhật' },
          { label: 'Ngày sinh', value: recruiter.dob ? formatDate(recruiter.dob) : 'Chưa cập nhật' },
          { label: 'Vai trò', value: recruiter.role?.name || 'Chưa cập nhật' },
          { label: 'Trạng thái tài khoản', value: recruiter.enabled ? 'Đang hoạt động' : 'Đã khóa' },
        ],
      },
      {
        title: 'Thông tin liên hệ',
        items: [
          { label: 'Số điện thoại', value: hideSensitiveContact ? 'Đã ẩn' : recruiter.phone || 'Chưa cập nhật' },
          { label: 'Địa chỉ', value: recruiterAddresses },
        ],
      },
      {
        title: 'Thông tin công việc',
        items: [
          { label: 'Vị trí', value: recruiter.position || 'Chưa cập nhật' },
          { label: 'Công ty', value: recruiter.company?.name || 'Chưa cập nhật' },
        ],
      },
    );
  }

  if (applicant) {
    infoSections.push(
      {
        title: 'Thông tin ứng viên cơ bản',
        items: [
          { label: 'Số điện thoại', value: hideSensitiveContact ? 'Đã ẩn' : applicant.phone || 'Chưa cập nhật' },
          { label: 'Giới tính', value: applicant.gender || 'Chưa cập nhật' },
          { label: 'Ngày sinh', value: applicant.dob ? formatDate(applicant.dob) : 'Chưa cập nhật' },
          { label: 'Vai trò', value: applicant.role?.name || 'Chưa cập nhật' },
        ],
      },
      {
        title: 'Hồ sơ ứng viên',
        items: [
          { label: 'Địa chỉ', value: applicantAddresses },
          { label: 'Học vấn', value: applicant.education || 'Chưa cập nhật' },
          { label: 'Trình độ', value: applicant.level || 'Chưa cập nhật' },
          {
            label: 'Trạng thái tìm việc',
            value: applicant.availableStatus ? 'Đang tìm việc' : 'Chưa sẵn sàng',
          },
        ],
      },
    );
  }

  if (isCompany) {
    infoSections.push(
      {
        title: 'Thông tin công ty cơ bản',
        items: [
          { label: 'Website', value: me.website || 'Chưa cập nhật' },
          { label: 'Vai trò', value: me.role?.name || 'Chưa cập nhật' },
        ],
      },
      {
        title: 'Liên hệ và vận hành',
        items: [
          { label: 'Số điện thoại', value: hideSensitiveContact ? 'Đã ẩn' : me.phone || 'Chưa cập nhật' },
          { label: 'Quy mô', value: me.size || 'Chưa cập nhật' },
          { label: 'Đã xác minh', value: me.verified ? 'Đã xác minh' : 'Chưa xác minh' },
          { label: 'Quốc gia', value: me.country || 'Chưa cập nhật' },
          { label: 'Lĩnh vực', value: me.industry || 'Chưa cập nhật' },
          { label: 'Ngày làm việc', value: me.workingDays || 'Chưa cập nhật' },
        ],
      },
      {
        title: 'Địa chỉ và thành tựu',
        items: [
          { label: 'Địa chỉ', value: companyAddresses },
          { label: 'Giải thưởng', value: companyAwards },
        ],
      },
    );
  }

  return (
    <Card className="mt-16 border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
          </div>

          <div className="text-sm space-y-1">
            {username && <p className="text-sm text-muted-foreground">@{username}</p>}
            {!hideSensitiveContact && email && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{email}</span>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          <div className="space-y-4">
            <p className="text-sm">Mô tả: {description || 'Chưa cập nhật mô tả'}</p>
            <p className="text-sm">Tiểu sử: {bio || 'Chưa cập nhật tiểu sử'}</p>

            {infoSections.length > 0 && (
              <div className="space-y-4 top-2">
                {infoSections.map((section) => (
                  <div key={section.title} className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <p key={`${section.title}-${item.label}`} className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{item.label}: </span>
                          {item.label === 'Website' && item.value !== 'Chưa cập nhật' ? (
                            <a
                              href={normalizeWebsiteUrl(item.value)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <span>{item.value}</span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
