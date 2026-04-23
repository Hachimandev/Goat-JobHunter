'use client';
import { useIsMobile } from '@/hooks/use-mobile';
import { ReactNode } from 'react';

const UIGuardWrapper = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="p-4 text-center text-gray-500">
        Ứng dụng này không hỗ trợ trên thiết bị di động. Vui lòng sử dụng trên máy tính để có trải nghiệm tốt nhất.
      </div>
    );
  }

  return children;
};

export default UIGuardWrapper;
