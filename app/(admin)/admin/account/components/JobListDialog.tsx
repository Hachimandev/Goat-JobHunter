import { useFetchJobsByRecruiterQuery } from "@/services/job/jobApi";
import { useMemo, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoaderSpin from "@/components/common/LoaderSpin";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty";
import { User } from "@/types/model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomPagination from "@/components/common/CustomPagination";
import { formatCurrency } from "@/utils/formatCurrency";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface JobListDialogProps {
  readonly user: User;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export default function JobListDialog({ user, open, onOpenChange }: JobListDialogProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useFetchJobsByRecruiterQuery(
    {
      recruiterId: user.accountId,
      page,
      size: 10
    }, {
      skip: !open || !user
    }
  );

  const jobs = useMemo(() => data?.data?.result || [], [data]);
  const meta = useMemo(() => data?.data?.meta || {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0
  }, [data]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl! rounded-xl">
        <DialogHeader>
          <DialogTitle>
            Việc làm của {user.fullName || user.email}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {isLoading && <LoaderSpin />}

        {isError && (
          <ErrorMessage message="Đã xảy ra lỗi khi tải danh sách việc làm. Vui lòng thử lại sau." />
        )}

        {jobs.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Không có việc làm nào được tìm thấy</EmptyTitle>
              <EmptyDescription>
                Người dùng này chưa đăng việc làm nào. Hãy thử lại sau.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {jobs && jobs.length > 0 && (
          <ScrollArea className="h-80 rounded-md">
            <ul className="space-y-2">
              {jobs.map((job) => (
                <li key={job.jobId} className="p-2 border rounded flex items-center justify-between">
                  <div className={"space-y-1"}>
                    <div className="font-semibold">{job.title}</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className={"flex items-center"}><DollarSign
                        className={"h-4 w-4 mr-2"} /> {formatCurrency(job.salary)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={job.active ? "default" : "destructive"}>{job.active ? "Đang tuyển" : "Đã đóng"}
                  </Badge>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}

        <CustomPagination
          currentPage={meta.page}
          totalPages={meta.pages}
          onPageChange={setPage}
          onNextPage={() => setPage((prev) => prev + 1)}
          onPreviousPage={() => setPage((prev) => prev - 1)}
          hasNextPage={page <= meta.pages - 1}
          hasPreviousPage={page > 1}
        />
      </DialogContent>
    </Dialog>
  );
}