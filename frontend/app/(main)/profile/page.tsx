"use client";
import { ProfileTabs } from "@/app/(main)/profile/components";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty";
import { useUser } from "@/hooks/useUser";
import { useGetMyAccountQuery } from "@/services/auth/authApi";
import ProfileHeader from "@/components/common/ProfileHeader";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ProfilePage = () => {
  // Fetch user data to ensure it's up-to-date when accessing the profile page,
  // the data returned is stored in the redux store handle by rtk query automatically
  useGetMyAccountQuery();

  const { user, isSignedIn } = useUser(); // Get user data from redux store
  const [activeTab, setActiveTab] = useState("notifications");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Set initial tab from URL on mount
  useEffect(() => {
    const tabFromUrl = searchParams?.get("tab");
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync activeTab -> URL (replace to avoid history entries)
  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams?.entries?.() ?? []));

    params.set("tab", activeTab);

    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;

    router.replace(newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);


  if (!user || !isSignedIn) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Không tìm thấy hồ sơ</EmptyTitle>
          <EmptyDescription>
            Hồ sơ bạn đang tìm kiếm không tồn tại hoặc đã xảy ra lỗi. Hãy thử
            lại sau.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <main className="flex-1">
      <ProfileHeader type={user?.role?.name} />
      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
};

export default ProfilePage;
