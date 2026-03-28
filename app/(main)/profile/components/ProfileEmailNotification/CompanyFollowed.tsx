import ErrorMessage from '@/components/common/ErrorMessage';
import LoaderSpin from '@/components/common/LoaderSpin';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import EmptyTable from '../EmptyTable';
import { useGetFollowedCompaniesQuery } from '@/services/user/userApi';
import useCompanyActions from '@/hooks/useCompanyActions';
import { slugify } from '@/utils/slug';

const CompanyFollowed = () => {
  const { data, isLoading, isError, isSuccess, refetch } = useGetFollowedCompaniesQuery();

  const companies = useMemo(() => data?.data || [], [data]);

  const { handleUnfollowCompanies, isUnfollowing } = useCompanyActions();

  if (isLoading) {
    return <LoaderSpin />;
  }

  if (companies.length === 0) {
    return <EmptyTable type="companies" />;
  }

  if (isError) {
    return (
      <ErrorMessage message="Đã có lỗi xảy ra khi tải công ty đã theo dõi. Vui lòng thử lại sau" onRetry={refetch} />
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên công ty</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isSuccess &&
            companies.map((company) => (
              <TableRow key={company.accountId}>
                <TableCell>
                  <div className="max-w-xs">
                    <Link
                      href={`/companies/${slugify(company.name)}`}
                      className="font-medium hover:text-primary hover:underline truncate block"
                    >
                      {company.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <span className="truncate block">{company?.email || 'Chưa cung cấp'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <span className="truncate block">{company?.phone || 'Chưa cung cấp'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-start gap-2">
                    <Link href={`/companies/${slugify(company.name)}`}>
                      <Button variant="ghost" size="sm" className="rounded-xl" title="Xem chi tiết">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleUnfollowCompanies([company.accountId])}
                      disabled={isUnfollowing}
                      title="Hủy theo dõi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompanyFollowed;
