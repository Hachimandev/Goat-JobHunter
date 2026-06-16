import { ApplicationStatus } from '@/types/enum';

export const getStatusConfig = (status: ApplicationStatus) => {
  switch (status) {
    case ApplicationStatus.ACCEPTED:
      return {
        label: 'Đã chấp nhận',
        variant: 'default' as const,
        className: 'bg-green-500 hover:bg-green-600 text-white',
      };
    case ApplicationStatus.REJECTED:
      return {
        label: 'Đã từ chối',
        variant: 'destructive' as const,
        className: '',
      };
    case ApplicationStatus.PENDING:
    default:
      return {
        label: 'Đang chờ',
        variant: 'secondary' as const,
        className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      };
  }
};
