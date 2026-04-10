'use client';

import { JobHeader, JobInfoGrid } from '@/app/(main)/jobs/[id]/components';
import ResumeDialog from '@/app/(main)/jobs/[id]/components/ResumeDialog';
import useDetailJob from '@/app/(main)/jobs/[id]/hooks/useDetailJob';
import LoaderSpin from '@/components/common/LoaderSpin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import useJobActions from '@/hooks/useJobActions';
import { BookmarkPlus, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import ErrorMessage from '@/components/common/ErrorMessage';
import { HasApplicant } from '@/components/common/HasRole';
import RichTextPreview from '@/components/RichText/Preview';
import { useCountApplicationsByJobAndApplicantQuery } from '@/services/application/applicationApi';
import { useMemo } from 'react';
import CompanyInfo from './CompanyInfo';

interface JobDetailViewProps {
  jobId: number | null;
}

export default function JobDetailView({ jobId }: JobDetailViewProps) {
  const router = useRouter();

  const { isSignedIn, user } = useUser();
  const { handleToggleSaveJob } = useJobActions();
  const {
    isDialogOpen,
    setIsDialogOpen,

    job,
    isSaved,
    isLoading,
    isError,
    isSuccess,

    company,
    isLoadingCompany,
    isErrorCompany,

    numberOfApplications,

    handleOpenCVDialog,
  } = useDetailJob(String(jobId));

  const { data } = useCountApplicationsByJobAndApplicantQuery(
    {
      jobId: job?.jobId || -1,
    },
    {
      skip: !user || !job || !isSignedIn,
    },
  );

  const count = useMemo(() => data?.data?.submittedApplications || 0, [data]);

  const isCanApply = useMemo(() => count < 3, [count]);

  const handleSkillClick = (skill: string) => {
    const params = new URLSearchParams();
    params.set('skills', skill);
    router.push(`/jobs?${params.toString().replaceAll('+', '%20')}`);
  };

  const applyTooltipTitle = useMemo(() => {
    if (!isCanApply) {
      return 'Bạn đã đạt giới hạn ứng tuyển cho công việc này.';
    }

    if (!job?.active) {
      return 'Công việc đã đóng, không thể ứng tuyển.';
    }

    return '';
  }, [isCanApply, job?.active]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!job || isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Có lỗi xảy ra khi tải thông tin công việc</EmptyTitle>
          <EmptyDescription>Vui lòng thử lại sau hoặc quay lại trang việc làm.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/jobs" className="text-primary hover:underline">
            Quay lại trang việc làm
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div>
      <div className="">
        {job && isSuccess && (
          <div className="">
            <Card className="py-0 h-full">
              <JobHeader
                job={job}
                actions={
                  <>
                    <Button
                      onClick={(e) => handleToggleSaveJob(e, job, isSaved)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 rounded-xl"
                    >
                      <BookmarkPlus className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                      {isSaved ? 'Đã lưu' : 'Lưu'}
                    </Button>
                    <HasApplicant user={user!}>
                      <div title={applyTooltipTitle}>
                        <Button
                          onClick={handleOpenCVDialog}
                          disabled={!job.active || !isCanApply}
                          size="sm"
                          className="flex items-center gap-2 rounded-xl"
                        >
                          <Send className="w-4 h-4" />
                          Ứng tuyển
                        </Button>
                      </div>
                    </HasApplicant>
                  </>
                }
              />

              {isErrorCompany && <ErrorMessage message={'Có lỗi xảy ra khi tải thông tin công ty.'} />}
              {company && !isLoadingCompany && !isErrorCompany && <CompanyInfo company={company} />}
              {isLoadingCompany && <LoaderSpin />}

              <CardContent className="px-6 pb-6">
                <Separator className="mb-4" />
                <JobInfoGrid job={job} />
                <HasApplicant user={user!}>
                  <div className="flex justify-between items-center bg-primary/10 px-4 py-2 border border-primary rounded-xl">
                    <span className="text-primary">Tổng đơn đã nộp:</span>
                    <span className="text-primary font-semibold">{numberOfApplications}</span>
                  </div>
                </HasApplicant>
                <Separator className="my-4" />

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4 capitalize">Mô Tả Công Việc</h2>
                  <RichTextPreview content={job.description} className="prose max-w-none mb-4" />
                </div>

                <Separator className="my-4" />
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4 capitalize">Kỹ Năng Yêu Cầu</h2>
                  <div className="flex flex-wrap gap-2">
                    {(job?.skills || []).map((skill) => (
                      <Badge
                        key={skill.skillId}
                        variant="outline"
                        className="px-3 py-1.5 bg-white text-gray-700 text-[14px] font-medium border border-gray-300 hover:border-primary hover:text-primary transition-colors cursor-pointer rounded-2xl"
                        onClick={() => handleSkillClick(skill.name)}
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {job && (
        <ResumeDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          job={job}
          accountId={user?.accountId}
          userEmail={user?.email}
        />
      )}
    </div>
  );
}
