'use client';

import { JobCard } from '@/app/(main)/jobs/components';
import { JobFilters } from '@/app/(main)/jobs/hooks/useJobsFilter';
import { Job } from '@/types/model';

interface JobListProps {
  jobs: Job[];
  savedJobs: {
    jobId: number;
    result: boolean;
  }[];
  viewMode: 'list' | 'grid';
  filters: JobFilters;
  onFilterChange: (filters: JobFilters) => void;
  onJobClick?: (jobId: number) => void;
  selectedJobId?: number | null;
}

export default function JobList({
  jobs,
  savedJobs,
  viewMode,
  filters,
  onFilterChange,
  onJobClick,
  selectedJobId,
}: Readonly<JobListProps>) {
  const handleLevelClick = (level: string) => {
    if (onFilterChange && filters) {
      onFilterChange({
        ...filters,
        level: filters.level?.includes(level) ? [] : [level],
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWorkingTypeClick = (workingType: string) => {
    if (onFilterChange && filters) {
      onFilterChange({
        ...filters,
        workingType: filters.workingType?.includes(workingType) ? [] : [workingType],
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard
            key={job.jobId}
            job={job}
            viewMode="grid"
            onLevelClick={handleLevelClick}
            onWorkingTypeClick={handleWorkingTypeClick}
            isSaved={savedJobs.find((j) => j.jobId === job.jobId)?.result || false}
            onJobClick={onJobClick}
            isSelected={selectedJobId === job.jobId}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.jobId}
          job={job}
          viewMode="list"
          onLevelClick={handleLevelClick}
          onWorkingTypeClick={handleWorkingTypeClick}
          isSaved={savedJobs.find((j) => j.jobId === job.jobId)?.result || false}
          onJobClick={onJobClick}
          isSelected={selectedJobId === job.jobId}
        />
      ))}
    </div>
  );
}
