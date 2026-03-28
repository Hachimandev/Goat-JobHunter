import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';
import { MeResponse, UserResponse } from '@/types/dto';
import { Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { isApplicantResponse, isCompanyResponse, isRecruiterResponse, normalizeWebsiteUrl } from '@/utils/slug';

export function ProfileInfo() {
  const { user } = useUser();

  if (!user) return null;

  const me = user as MeResponse;
  const isCompany = isCompanyResponse(me);
  const displayName = isCompany ? me.name : (me as UserResponse).fullName || me.email;
  const username = isCompany ? undefined : (me as UserResponse).username;
  const email = me.email;
  const description = isCompany ? me.description : (me as UserResponse).headline;
  const bio = isCompany ? me.overtimePolicy : (me as UserResponse).bio;

  const detailItems = [
    ...(isRecruiterResponse(me)
      ? [
          { label: 'Vị trí', value: me.position || 'Chưa cập nhật' },
          { label: 'Công ty', value: me.company?.name || 'Chưa cập nhật' },
        ]
      : []),
    ...(isApplicantResponse(me)
      ? [
          { label: 'Trình độ', value: me.level || 'Chưa cập nhật' },
          { label: 'Học vấn', value: me.education || 'Chưa cập nhật' },
          {
            label: 'Trạng thái tìm việc',
            value: me.availableStatus ? 'Đang tìm việc' : 'Chưa sẵn sàng',
          },
        ]
      : []),
    ...(isCompany
      ? [
          { label: 'Lĩnh vực', value: me.industry || 'Chưa cập nhật' },
          { label: 'Quy mô', value: me.size || 'Chưa cập nhật' },
          { label: 'Quốc gia', value: me.country || 'Chưa cập nhật' },
          { label: 'Website', value: me.website || 'Chưa cập nhật' },
        ]
      : []),
  ];

  return (
    <Card className="mt-16 border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
          </div>

          <div className="text-sm space-y-1">
            {username && <p className="text-sm text-muted-foreground">@ {username}</p>}

            {email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{email}</span>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          <div className="space-y-4">
            <p className="text-sm">Mô tả: {description || 'Chưa cập nhật mô tả'}</p>
            <p className="text-sm">Tiểu sử: {bio || 'Chưa cập nhật tiểu sử'}</p>

            {detailItems.length > 0 && (
              <div className="space-y-2 pt-2">
                {detailItems.map((item) => (
                  <p key={item.label} className="text-sm text-muted-foreground">
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
