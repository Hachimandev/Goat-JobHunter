'use client';

import { Sidebar } from '@/app/(chat)/messages/components/Sidebar';
import { useSubscribeToMessagesQuery } from '@/services/chatRoom/message/messageApi';
import { useUser } from '@/hooks/useUser';
import { SidebarNav } from '@/app/(chat)/SidebarNav';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PendingMessagesProvider } from '@/contexts/PendingMessagesContext';

interface ChatLayoutProps {
  readonly children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/hub/fyp');
    }
  }, [isSignedIn, router]);

  useSubscribeToMessagesQuery(undefined, { skip: !isSignedIn });

  return (
    <PendingMessagesProvider>
      <div className="h-screen flex overflow-hidden bg-gray-50">
        <SidebarNav />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-full md:w-[34vw] lg:w-[30vw] xl:w-[28vw] md:min-w-[340px] md:max-w-[460px] shrink-0 border-r border-border bg-white">
            <Sidebar />
          </div>
          <div className="flex-1 hidden md:flex min-w-0 min-h-0 bg-white">{children}</div>
        </div>
      </div>
    </PendingMessagesProvider>
  );
}
