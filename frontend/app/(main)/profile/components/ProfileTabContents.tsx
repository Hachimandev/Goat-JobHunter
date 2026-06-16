import {
  ProfileEmailNotification,
  ProfileInfo,
  ProfileNotifications,
  ProfilePassword,
  ProfileDevices
} from '@/app/(main)/profile/components';
import { TabsContent } from '@/components/ui/tabs';

const ProfileTabContents = () => {
  return (
    <>
      <TabsContent value="notifications" className="space-y-4">
        <ProfileNotifications />
      </TabsContent>

      <TabsContent value="password" className="space-y-4">
        <ProfilePassword />
      </TabsContent>

      <TabsContent value="email" className="space-y-4">
        <ProfileEmailNotification />
      </TabsContent>

      <TabsContent value="info" className="space-y-4">
        <ProfileInfo />
      </TabsContent>

      <TabsContent value="devices" className="space-y-4">
        <ProfileDevices />
      </TabsContent>
    </>
  );
};

export default ProfileTabContents;
