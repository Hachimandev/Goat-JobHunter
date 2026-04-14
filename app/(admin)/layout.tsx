'use client';

import Sidebar, { SidebarTab } from '@/components/common/Sidebar';
import {
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  Lock,
  MessageCircleCode,
  Shield,
  Users,
  Wrench,
} from 'lucide-react';
import { AIChatPopup } from '@/components/common/AIChatPopup';
import { useGetMyAccountQuery } from '@/services/auth/authApi';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useEffect } from 'react';
import { ROLE } from '@/constants/constant';
import { NotificationPopup, UserPopup } from '@/app/(main)/components';

const AdminTabs: SidebarTab[] = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    url: '/dashboard',
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: 'blog',
    label: 'Bài viết',
    url: '/admin/blog',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: 'job',
    label: 'Việc làm',
    url: '/admin/job',
    icon: <BriefcaseBusiness className="w-4 h-4" />,
  },
  {
    id: 'account',
    label: 'Tài khoản',
    url: '/admin/account',
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: 'role',
    label: 'Vai trò',
    url: '/admin/role',
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: 'permission',
    label: 'Quyền hạn',
    url: '/admin/permission',
    icon: <Lock className="w-4 h-4" />,
  },
  {
    id: 'career',
    label: 'Quản lý ngành nghề',
    url: '/admin/career',
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    id: 'skill',
    label: 'Quản lý kỹ năng',
    url: '/admin/skill',
    icon: <Wrench className="w-4 h-4" />,
  },
  {
    id: 'chat',
    label: 'Trợ lý AI',
    url: '/chat',
    type: 'external',
    icon: <MessageCircleCode className="w-4 h-4" />,
  },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  useGetMyAccountQuery();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    // Check if user has recruiter role
    const isAdmin = user?.role?.name === ROLE.SUPER_ADMIN || user?.role?.name === ROLE.COMPANY;

    if (!isAdmin) {
      // Not recruiter, redirect to home
      router.replace('/');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar tabs={AdminTabs} logoHref={'/'} />

      <div className="flex-1 ml-64">
        <div className="bg-sidebar px-4 py-2 border-b border-sidebar-border flex items-center justify-end gap-4">
          <NotificationPopup />
          <UserPopup />
        </div>
        <div className="space-y-6 p-6">{children}</div>
      </div>

      <AIChatPopup />
    </div>
  );
};

export default AdminLayout;
