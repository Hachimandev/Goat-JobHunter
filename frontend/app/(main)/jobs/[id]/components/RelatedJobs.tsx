import { JobCard } from "@/app/(main)/jobs/components";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoaderSpin from "@/components/common/LoaderSpin";
import { Card } from "@/components/ui/card";
import { Job } from "@/types/model";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty";
import CustomPagination from "@/components/common/CustomPagination";

interface RelatedJobsProps {
  jobs: Job[];
  isLoading: boolean;
  isError: boolean;
  savedJobs: {
    jobId: number;
    result: boolean;
  }[];
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  },
  page: number;
  setPage: (page: number) => void;
}

function RelatedJobs({ jobs, isLoading, isError, savedJobs, meta, page, setPage }: Readonly<RelatedJobsProps>) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-foreground">Việc Làm Liên Quan</h3>

      {isLoading && <LoaderSpin />}

      {isError && (
        <ErrorMessage message="Không thể tải các công việc liên quan." />
      )}

      {jobs.length === 0 &&
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Không tìm thấy việc làm nào</EmptyTitle>
            <EmptyDescription>Vui lòng tìm kiếm các việc làm khác hoặc thử lại sau.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      }

      <div className="grid grid-cols-3 gap-4">
        {jobs?.map((relatedJob) => (
          <JobCard
            key={relatedJob.jobId}
            job={relatedJob}
            viewMode="grid"
            isSaved={savedJobs.find(j => j.jobId === relatedJob.jobId)?.result || false}
          />
        ))}
      </div>

      <div className={"mt-4"}>
        <CustomPagination
          currentPage={page}
          totalPages={meta?.pages}
          onPageChange={setPage}
          onNextPage={() => setPage(page + 1)}
          onPreviousPage={() => setPage(page - 1)}
          hasNextPage={page < meta?.pages}
          hasPreviousPage={page > 1}
        />
      </div>
    </Card>
  );
}

export default RelatedJobs;
