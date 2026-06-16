import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Lock, Mail, MonitorSmartphone, UserIcon } from 'lucide-react';

const ProfileTabsList = () => {
  return (
    <TabsList className="w-full flex mb-8">
      <TabsTrigger value="notifications" className="flex items-center gap-2 rounded-xl cursor-pointer">
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Thông Báo</span>
      </TabsTrigger>
      <TabsTrigger value="password" className="flex items-center gap-2 rounded-xl cursor-pointer">
        <Lock className="h-4 w-4" />
        <span className="hidden sm:inline">Mật Khẩu</span>
      </TabsTrigger>

      <TabsTrigger value="email" className="flex items-center gap-2 rounded-xl cursor-pointer">
        <Mail className="h-4 w-4" />
        <span className="hidden sm:inline">Email</span>
      </TabsTrigger>

      <TabsTrigger value="info" className="flex items-center gap-2 rounded-xl cursor-pointer">
        <UserIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Thông Tin</span>
      </TabsTrigger>

      <TabsTrigger value="devices" className="flex items-center gap-2 rounded-xl cursor-pointer">
        <MonitorSmartphone className="h-4 w-4" />
        <span className="hidden sm:inline">Phiên đăng nhập</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default ProfileTabsList;
