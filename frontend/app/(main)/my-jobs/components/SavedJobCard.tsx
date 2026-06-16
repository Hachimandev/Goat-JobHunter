'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader } from '@/components/ui/card';
import { Job } from '@/types/model';
import { formatDate } from '@/utils/formatDate';
import { capitalize } from 'lodash';
import { Calendar, MapPin, BookmarkCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useJobActions from '@/hooks/useJobActions';

interface SavedJobCardProps {
  job: Job;
}

export default function SavedJobCard({ job }: SavedJobCardProps) {
  const router = useRouter();
  const { handleUnsaveJob } = useJobActions();

  const handleSkillClick = (skill: string) => {
    const params = new URLSearchParams();
    params.set('skills', skill);
    router.push(`/jobs?${params.toString().replaceAll('+', '%20')}`);
  };

  const handleWorkingTypeClick = (workingType: string) => {
    const params = new URLSearchParams();
    params.set('workingType', workingType);
    router.push(`/jobs?${params.toString().replaceAll('+', '%20')}`);
  };

  const handleLevelClick = (level: string) => {
    const params = new URLSearchParams();
    params.set('level', level);
    router.push(`/jobs?${params.toString().replaceAll('+', '%20')}`);
  };

  const handleViewJob = () => {
    router.push(`/jobs/${job.jobId}`);
  };

  const handleUnsaveJobClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleUnsaveJob(job);
  };

  return (
    <div className="block cursor-pointer relative h-full">
      <Card className="overflow-visible hover:shadow-lg transition-all py-0 relative h-full flex flex-col">
        <div className="flex gap-4 p-4 flex-1">
          <div className="flex-1 flex flex-col">
            <CardHeader className="p-0 gap-0 flex-1">
              <div className="flex items-start justify-between gap-4 h-full">
                <div className="flex-1 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLevelClick(job.level);
                      }}
                    >
                      {capitalize(job.level)}
                    </Badge>
                    <Badge variant={job.active ? 'default' : 'outline'}>{job.active ? 'Đang tuyển' : 'Đã đóng'}</Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleWorkingTypeClick(job.workingType || '');
                      }}
                    >
                      {capitalize(job.workingType)}
                    </Badge>
                    <button
                      onClick={handleUnsaveJobClick}
                      className="ml-auto p-1.5 rounded-full hover:bg-primary/10 transition-colors group cursor-pointer"
                      title="Bỏ lưu"
                    >
                      <BookmarkCheck className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <h3 className="font-bold text-lg text-foreground hover:text-primary" onClick={handleViewJob}>
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(job?.skills || []).slice(0, 3).map((skill) => (
                      <Badge
                        key={skill.skillId}
                        variant="outline"
                        className="px-1.5 py-1.5 bg-white text-gray-700 text-[14px] font-medium border border-gray-300 hover:border-primary hover:text-primary transition-colors cursor-pointer rounded-2xl"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSkillClick(skill.name);
                        }}
                      >
                        {skill.name}
                      </Badge>
                    ))}
                    {(job?.skills || []).length > 3 && (
                      <Badge
                        variant="outline"
                        className="px-1.5 py-1.5 bg-white text-gray-700 text-[14px] font-medium border border-gray-300 hover:border-primary hover:text-primary transition-colors cursor-pointer rounded-2xl"
                        onClick={handleViewJob}
                      >
                        ...
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.address.province}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {job.startDate && <span>{formatDate(job.startDate)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </div>
        </div>
      </Card>
    </div>
  );
}
