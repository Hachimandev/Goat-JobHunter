'use client';

import CompanyFollowed from '@/app/(main)/profile/components/ProfileEmailNotification/CompanyFollowed';
import SkillSubscription from '@/app/(main)/profile/components/ProfileEmailNotification/SkillSubscription';
import { Card } from '@/components/ui/card';

export default function ProfileEmailNotification() {
  return (
    <div className="space-y-6">
      <SkillSubscription />
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Công ty đã theo dõi</h2>
        <p className="text-sm text-green-600 mb-4">Nhận thêm thông báo khi công ty bạn yêu thích có việc làm mới.</p>
        <CompanyFollowed />
      </Card>
    </div>
  );
}
