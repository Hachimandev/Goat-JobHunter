import { useMemo, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoaderSpin from "@/components/common/LoaderSpin";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty";
import { Application, User } from "@/types/model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomPagination from "@/components/common/CustomPagination";
import {
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  User2, XCircle
} from "lucide-react";
import { useFetchApplicationsByApplicantQuery } from "@/services/application/applicationApi";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";

function StatusBadge({ status }: { readonly status: Application["status"] }) {
  const map = {
    PENDING: {
      text: "Chờ xử lý",
      icon: <Clock className="h-4 w-4 inline-block mr-1" />,
      color: "bg-yellow-100 text-yellow-800"
    },
    ACCEPTED: {
      text: "Chấp nhận",
      icon: <CheckCircle className="h-4 w-4 inline-block mr-1" />,
      color: "bg-green-100 text-green-800"
    },
    REJECTED: {
      text: "Từ chối",
      icon: <XCircle className="h-4 w-4 inline-block mr-1" />,
      color: "bg-red-100 text-red-800"
    }
  } as const;

  const s = map[status] ?? map.PENDING;
  return (
    <Badge className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${s.color}`}>
      {s.icon}
      {s.text}
    </Badge>
  );
}

interface ApplicationListDialogProps {
  readonly user: User;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export default function ApplicationListDialog({ user, open, onOpenChange }: ApplicationListDialogProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useFetchApplicationsByApplicantQuery(
    {
      applicantId: user.accountId,
      page,
      size: 10
    }, {
      skip: !open || !user
    }
  );

  const applications = useMemo(() => data?.data?.result || [], [data]);
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
            Đơn ứng tuyển của {user.fullName || user.email}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {isLoading && <LoaderSpin />}

        {isError && (
          <ErrorMessage message="Đã xảy ra lỗi khi tải danh sách đơn ứng tuyển. Vui lòng thử lại sau." />
        )}

        {applications.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Không có đơn ứng tuyển nào được tìm thấy</EmptyTitle>
              <EmptyDescription>
                Người dùng này chưa tạo đơn ứng tuyển nào. Hãy thử lại sau.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {applications && applications.length > 0 && (
          <ScrollArea className="h-80 rounded-md">
            <ul className="space-y-2">
              {applications.map((app) => (
                <li
                  key={app.applicationId}
                  className="p-3 border rounded-md flex items-start justify-between gap-4 bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold truncate">{app.job?.title || "—"}</div>
                    </div>

                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(app.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User2 className="h-4 w-4" />
                        <div className="text-sm text-muted-foreground">{app.createdBy}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <p className="truncate underline-offset-2">
                          {app.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={app.status as Application["status"]} />
                    </div>


                  </div>
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