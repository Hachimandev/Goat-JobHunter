'use client';

import CustomPagination from '@/components/common/CustomPagination';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoaderSpin from '@/components/common/LoaderSpin';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { useFetchDevicesByCurrentUserQuery } from '@/services/user/userApi';
import { formatDateTime } from '@/utils/formatDate';
import { MonitorSmartphone } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function ProfileDevices() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const { data, isLoading, isError, refetch } = useFetchDevicesByCurrentUserQuery({
    page: currentPage,
    size: pageSize,
  });

  const devices = useMemo(() => data?.data?.result ?? [], [data]);
  const meta = useMemo(() => data?.data?.meta, [data]);
  const totalPages = useMemo(() => meta?.pages ?? 0, [meta]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return <LoaderSpin />;
  }

  if (isError) {
    return (
      <ErrorMessage message="Đã có lỗi xảy ra khi tải danh sách thiết bị. Vui lòng thử lại sau." onRetry={refetch} />
    );
  }

  if (!devices.length) {
    return (
      <Empty className="border rounded-xl">
        <EmptyHeader>
          <EmptyTitle>Không có thiết bị nào</EmptyTitle>
          <EmptyDescription>Hiện tại tài khoản của bạn chưa có thiết bị nào được ghi nhận.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {devices.map((device) => (
          <div
            key={device.deviceId}
            className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MonitorSmartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{device.name}</p>
                <p className="text-xs text-muted-foreground">Đăng nhập lúc: {formatDateTime(device.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            hasNextPage={currentPage < totalPages}
            hasPreviousPage={currentPage > 1}
            visiblePageRange={2}
          />
        </div>
      )}
    </div>
  );
}
