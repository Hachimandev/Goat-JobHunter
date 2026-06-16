'use client';

import JobGridCard from '@/app/(main)/jobs/components/JobGridCard';
import JobListCard from '@/app/(main)/jobs/components/JobListCard';
import useJobActions from '@/hooks/useJobActions';
import { Job } from '@/types/model';
import { useRouter } from 'next/navigation';

interface JobCardProps {
  job: Job;
  viewMode: 'list' | 'grid';
  isSaved: boolean;
  onLevelClick?: (level: string) => void;
  onWorkingTypeClick?: (workingType: string) => void;
  onJobClick?: (jobId: number) => void;
  isSelected?: boolean;
}

export default function JobCard({
  job,
  viewMode,
  isSaved,
  onLevelClick,
  onWorkingTypeClick,
  onJobClick,
  isSelected,
}: Readonly<JobCardProps>) {
  const router = useRouter();

  const handleLevelClick = (level: string) => {
    const params = new URLSearchParams();
    params.set('level', level);
    router.push(`/jobs?${params.toString()}`);

    if (onLevelClick) {
      onLevelClick(level);
    }
  };

  const handleWorkingTypeClick = (workingType: string) => {
    const params = new URLSearchParams();
    params.set('workingType', workingType);
    router.push(`/jobs?${params.toString()}`);

    if (onWorkingTypeClick) {
      onWorkingTypeClick(workingType);
    }
  };

  const { handleToggleSaveJob } = useJobActions();

  const handleSaveJob = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await handleToggleSaveJob(e, job, isSaved);
  };

  if (viewMode === 'grid') {
    return (
      <JobGridCard
        job={job}
        isSaved={isSaved}
        handleSaveJob={handleSaveJob}
        onLevelClick={onLevelClick ?? handleLevelClick}
        onWorkingTypeClick={handleWorkingTypeClick}
      />
    );
  }

  // List view
  return (
    <JobListCard
      job={job}
      isSaved={isSaved}
      handleSaveJob={handleSaveJob}
      onLevelClick={onLevelClick ?? handleLevelClick}
      onWorkingTypeClick={onWorkingTypeClick ?? handleWorkingTypeClick}
      onJobClick={onJobClick}
      isSelected={isSelected}
    />
  );
}
