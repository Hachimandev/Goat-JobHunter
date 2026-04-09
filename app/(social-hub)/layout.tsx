'use client';

import React, { useMemo } from 'react';
import { Header } from '@/app/(main)/components';
import { AIChatPopup } from '@/components/common/AIChatPopup';
import { PopularTags } from '@/app/(social-hub)/components/PopularTags';
import { UserFriendList } from '@/app/(social-hub)/components/UserFriendList';
import { UserDisplay } from '@/app/(social-hub)/components/UserDisplay';
import { NavigationBar } from '@/app/(social-hub)/components/NavigationBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFetchTagsQuery } from '@/services/blog/blogApi';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: tagsResponse } = useFetchTagsQuery({ keyword: '' });

  const popularTags = useMemo(() => {
    return tagsResponse?.data || [];
  }, [tagsResponse]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="flex bg-background max-w-7xl mx-auto gap-0">
          <aside className="w-64 shrink-0">
            <div className="sticky top-16 space-y-4 py-6">
              <UserDisplay />
              <NavigationBar />
            </div>
          </aside>

          <main className="flex-1 px-8 py-8 min-h-screen">{children}</main>

          <aside className="w-80 shrink-0">
            <ScrollArea className="sticky top-16 max-h-[calc(100vh-2rem)]">
              <div className="space-y-4 py-6 pr-4">
                <PopularTags popularTags={popularTags} />
                <UserFriendList />
              </div>
            </ScrollArea>
          </aside>
        </div>
      </main>
      <AIChatPopup />
    </div>
  );
};
export default Layout;
