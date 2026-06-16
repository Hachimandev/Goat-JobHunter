'use client';

import { AIChatSidebar } from './components/AIChatSidebar';
import { AIChatHeader } from './components/AIChatHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useUser } from '@/hooks/useUser';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AIChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/signin');
    }
  }, [isSignedIn, router]);

  return (
    <SidebarProvider defaultOpen={false}>
      <AIChatSidebar />

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <AIChatHeader />
        <main className="flex-1 overflow-hidden bg-gray-100">{children}</main>
      </div>
    </SidebarProvider>
  );
}
