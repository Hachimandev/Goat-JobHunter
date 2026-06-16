'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/hooks/useUser';
import { CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface JobSearchSettingsProps {
  isToggling: boolean;
  onToggleProfilePublic: () => void;
}

export const JobSearchSettings = ({ isToggling, onToggleProfilePublic }: JobSearchSettingsProps) => {
  const { user } = useUser();
  const serverIsAvailable = user && 'availableStatus' in user ? user.availableStatus : false;
  const [isAvailable, setIsAvailable] = useState(serverIsAvailable);

  useEffect(() => {
    setIsAvailable(serverIsAvailable);
  }, [serverIsAvailable]);

  const handleToggle = () => {
    setIsAvailable(!isAvailable);
    onToggleProfilePublic();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Cho phép NTD tìm kiếm hồ sơ</CardTitle>
            <Switch
              checked={isAvailable}
              onCheckedChange={handleToggle}
              className="cursor-pointer"
              disabled={isToggling}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <CardDescription className="text-sm">
            Bạn đang cho phép Nhà tuyển dụng (NTD) tìm kiếm hồ sơ các NTD uy tín có thể thấy hồ sơ của bạn khi tìm kiếm
            nghiệm làm việc, học vấn, kỹ năng... trên CV của bạn.
          </CardDescription>

          <div className={`space-y-2 rounded-lg p-3 ${isAvailable ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className={`flex items-start gap-2 text-sm ${isAvailable ? 'text-green-700' : 'text-gray-600'}`}>
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <p>
                Nếu cảm thấy bạn phù hợp, NTD sẽ gửi lời bạn một <strong>Lời mời kết nối</strong>.
              </p>
            </div>
            <div className={`flex items-start gap-2 text-sm ${isAvailable ? 'text-green-700' : 'text-gray-600'}`}>
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <p>
                Toàn bộ thông tin định danh cá nhân của bạn như họ tên, ảnh đại diện, số điện thoại, email, địa chỉ sẽ
                không được chia sẻ với NTD cho đến khi bạn xác nhận đồng ý với <strong>Lời mời kết nối</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
