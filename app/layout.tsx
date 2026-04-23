import { ReduxProvider } from '@/app/StoreProvider';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import NotificationListener from '@/components/common/NotificationListener';
import UserProfileRealtimeListener from '@/components/common/UserProfileRealtimeListener';
import FriendshipRealtimeListener from '@/components/common/FriendshipRealtimeListener';
import FriendshipInviteToastListener from '@/components/common/FriendshipInviteToastListener';
import MessageTextListener from '@/components/common/MessageTextListener';
import './globals.css';
import 'react-photo-album/styles.css';
import UIGuardWrapper from '@/components/common/UIGuardWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GOAT - Job Hunter',
  description: 'Tìm công việc tuyệt vời tại GOAT',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <UIGuardWrapper>
            <NotificationListener />
            <UserProfileRealtimeListener />
            <FriendshipRealtimeListener />
            <FriendshipInviteToastListener />
            <MessageTextListener />
            {children}
          </UIGuardWrapper>
        </ReduxProvider>
        <Toaster position="top-right" duration={3000} />
      </body>
    </html>
  );
}
