"use client";

import { JobCard } from "@/app/(main)/jobs/components";
import LoaderSpin from "@/components/common/LoaderSpin";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Job } from "@/types/model";
import { RefreshCcwIcon } from "lucide-react";
import { useState } from "react";

interface JobListProps {
  jobs: Job[];
  isLoading: boolean;
  isError: boolean;
  savedJobs: {
    jobId: number;
    result: boolean;
  }[];
}

export default function JobList({ jobs, isLoading, isError, savedJobs }: Readonly<JobListProps>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleReload = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sticky top-16 max-h-[calc(100vh-120px)] flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
        <h3 className="text-xl font-bold text-gray-900">{jobs.length} việc làm đang tuyển dụng</h3>
      </div>
      <div className="p-3 overflow-y-auto custom-scrollbar space-y-3">
        {isLoading && <LoaderSpin />}

        {!isLoading && jobs.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Công ty chưa có việc làm đang tuyển dụng</EmptyTitle>
              <EmptyDescription>
                Không có việc làm đang tuyển dụng nào vào lúc này. Vui lòng thử lại sau.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                className="rounded-xl"
                size="sm"
                onClick={handleReload}
                disabled={isRefreshing}
              >
                <RefreshCcwIcon className={isRefreshing ? "animate-spin" : ""} />
                {isRefreshing ? "Đang tải..." : "Tải lại"}
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {!isLoading &&
          !isError &&
          jobs.length > 0 &&
          jobs.map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              viewMode="grid"
              isSaved={savedJobs.find((j) => j.jobId === job.jobId)?.result || false}
            />
          ))}
      </div>
    </div>
  );
}
