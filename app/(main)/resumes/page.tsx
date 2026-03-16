'use client';

import CustomPagination from '@/components/common/CustomPagination';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/useUser';
import { useGetMyAccountQuery } from '@/services/auth/authApi';
import { Resume } from '@/types/model';
import { useState } from 'react';
import { EditResumeTitleDialog } from './components/EditResumeTitleDialog';
import { JobSearchSettings } from './components/JobSearchSettings';
import { ResumeList } from './components/ResumeList';
import { UploadResumeDialog } from './components/UploadResumeDialog';
import { ViewEvaluationsDialog } from './components/ViewEvaluationsDialog';
import { useResumeAction } from './hooks/useResumeAction';
import { HasApplicant } from '@/components/common/HasRole';
import { RecruiterResumeView } from './components/RecruiterResumeView';
import { LoginResponseDto } from '@/types/dto';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ResumePage = () => {
  useGetMyAccountQuery();

  const { user, isSignedIn } = useUser();
  const [selectedJobId, setSelectedJobId] = useState<string>('-1');
  const {
    resumes,
    isFetchingResumes,
    isProcessing,
    handleCreateResume,
    handleDeleteResume,
    handleToggleDefaultResume,
    handleTogglePublicResume,
    handleDownloadResume,
    handleUpdateTitle,
    handleToggleAvailableStatus,
    handleEvaluateResume,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    evaluations,
    isFetchingEvaluations,
    selectedResumeId,
    evaluationPage,
    totalEvaluationPages,
    handleFetchEvaluations,
    handleClearEvaluations,
    goToEvaluationPage,
    nextEvaluationPage,
    previousEvaluationPage,
    hasNextEvaluationPage,
    hasPreviousEvaluationPage,
    totalEvaluations,
    jobs,
  } = useResumeAction({
    initialPage: 1,
    itemsPerPage: 6,
    companyId: (user as LoginResponseDto)?.company?.companyId,
    jobId: selectedJobId || '-1',
  });

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [evaluationsDialogOpen, setEvaluationsDialogOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  const handleEditTitle = (resume: Resume) => {
    setSelectedResume(resume);
    setEditDialogOpen(true);
  };

  const handleViewEvaluations = (resumeId: string) => {
    handleFetchEvaluations(resumeId);
    setEvaluationsDialogOpen(true);
  };

  const handleCloseEvaluationsDialog = (open: boolean) => {
    setEvaluationsDialogOpen(open);
    if (!open) {
      handleClearEvaluations();
    }
  };

  const handleJobChange = (value: string) => {
    setSelectedJobId(value);
  };

  if (!user || !isSignedIn) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Vui lòng đăng nhập</EmptyTitle>
          <EmptyDescription>Bạn cần đăng nhập để quản lý CV của mình.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const isRecruiterOrCompany = user.role.name === 'HR' || user.role.name === 'COMPANY';

  return (
    <>
      {isRecruiterOrCompany && (
        <>
          <div className="h-screen flex flex-col">
            <div className="border-b border-border bg-primary/5 py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Quản lý hồ sơ ứng viên</h1>
                    <p className="font-bold">Xem và đánh giá hồ sơ ứng viên phù hợp</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">Vị trí tuyển dụng:</span>
                    <Select value={selectedJobId} onValueChange={handleJobChange}>
                      <SelectTrigger className="w-[320px] cursor-pointer rounded-xl text-primary font-bold">
                        <SelectValue placeholder="Chọn vị trí để lọc hồ sơ" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem key="-1" value="-1" className="cursor-pointer rounded-xl">
                          Chọn vị trí để lọc hồ sơ
                        </SelectItem>
                        {jobs.length > 0 ? (
                          jobs.map((job) => (
                            <SelectItem
                              key={job.jobId}
                              value={job.jobId.toString()}
                              className="cursor-pointer rounded-xl"
                            >
                              {job.title}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-6 text-center text-sm text-gray-500">Không có công việc nào</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <RecruiterResumeView
              resumes={resumes}
              isLoading={isFetchingResumes || isProcessing}
              onDownload={handleDownloadResume}
              job={selectedJobId}
            />
          </div>
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPreviousPage={previousPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            visiblePageRange={2}
          />
        </>
      )}

      <HasApplicant user={user}>
        {isFetchingResumes ? (
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <Skeleton className="h-8 w-64" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-96 w-full" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-7xl mx-auto gap-0 py-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="space-y-8">
                  <ResumeList
                    resumes={resumes}
                    title="CV đã tải lên"
                    emptyMessage="Tải lên CV của bạn để ứng tuyển công việc nhanh chóng hơn"
                    onUploadClick={() => setUploadDialogOpen(true)}
                    onDelete={handleDeleteResume}
                    onToggleDefault={handleToggleDefaultResume}
                    onTogglePublic={handleTogglePublicResume}
                    onDownload={handleDownloadResume}
                    onEditTitle={handleEditTitle}
                    onEvaluateResume={handleEvaluateResume}
                    onViewEvaluations={handleViewEvaluations}
                    isProcessing={isProcessing}
                    uploadButtonText="Tải CV lên"
                  />

                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    onNextPage={nextPage}
                    onPreviousPage={previousPage}
                    hasNextPage={hasNextPage}
                    hasPreviousPage={hasPreviousPage}
                    visiblePageRange={2}
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <JobSearchSettings isToggling={isProcessing} onToggleProfilePublic={handleToggleAvailableStatus} />
              </div>
            </div>

            <UploadResumeDialog
              open={uploadDialogOpen}
              onOpenChange={setUploadDialogOpen}
              onUpload={handleCreateResume}
              isUploading={isProcessing}
            />

            <EditResumeTitleDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              resume={selectedResume}
              onUpdate={handleUpdateTitle}
              isUpdating={isProcessing}
            />

            <ViewEvaluationsDialog
              open={evaluationsDialogOpen}
              onOpenChange={handleCloseEvaluationsDialog}
              resumeId={selectedResumeId}
              evaluations={evaluations}
              isFetchingEvaluations={isFetchingEvaluations}
              currentPage={evaluationPage}
              totalPages={totalEvaluationPages}
              totalEvaluations={totalEvaluations}
              onPageChange={goToEvaluationPage}
              onNextPage={nextEvaluationPage}
              onPreviousPage={previousEvaluationPage}
              hasNextPage={hasNextEvaluationPage}
              hasPreviousPage={hasPreviousEvaluationPage}
              onFetchEvaluations={handleFetchEvaluations}
            />
          </div>
        )}
      </HasApplicant>
    </>
  );
};

export default ResumePage;
