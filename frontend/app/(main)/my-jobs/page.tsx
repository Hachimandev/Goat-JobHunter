'use client';

import React, { useRef, useState, useEffect } from 'react';
import ApplicationCard from './components/ApplicationCard';
import SavedJobCard from './components/SavedJobCard';
import LoaderSpin from '@/components/common/LoaderSpin';
import CustomPagination from '@/components/common/CustomPagination';
import { Briefcase, FileX, Bookmark } from 'lucide-react';
import { useMyJob } from './hooks/useMyJob';
import { cn } from '@/lib/utils';
import { Application, Job } from '@/types/model';
import { HasApplicant } from '@/components/common/HasRole';
import { useUser } from '@/hooks/useUser';
import { ROLE } from '@/constants/constant';

export default function MyJobsPage() {
  const { user } = useUser();
  const {
    // State
    mainTab,
    totalPages,
    totalItems,
    page,

    // Data
    myJobs,

    // Loading states
    isLoadingMyJobs,
    isErrorMyJobs,
    isDownloading,

    // Handlers
    handleMainTabChange,
    handleDownloadResume,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
  } = useMyJob({
    initialPage: 1,
    itemsPerPage: 6,
  });

  const appliedTabRef = useRef<HTMLButtonElement>(null);
  const savedTabRef = useRef<HTMLButtonElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (user && user.role.name !== ROLE.APPLICANT && mainTab === 'applied') {
      handleMainTabChange('saved');
    }
  }, [user]);

  useEffect(() => {
    const activeTab = mainTab === 'applied' ? appliedTabRef.current : savedTabRef.current;
    if (activeTab) {
      setUnderlineStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [mainTab, totalItems]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Quản lý việc làm</h1>
        </div>
      </div>

      <div className="border-b border-border mb-6">
        <div className="flex gap-8 relative">
          <HasApplicant user={user}>
            <button
              ref={appliedTabRef}
              onClick={() => handleMainTabChange('applied')}
              className={cn(
                'pb-3 px-1 text-sm font-medium transition-colors duration-200 hover:text-foreground cursor-pointer',
                mainTab === 'applied' ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Việc làm đã ứng tuyển</span>
                {mainTab === 'applied' && totalItems > 0 && (
                  <span className="ml-1 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    {totalItems}
                  </span>
                )}
              </div>
            </button>
          </HasApplicant>

          <button
            ref={savedTabRef}
            onClick={() => handleMainTabChange('saved')}
            className={cn(
              'pb-3 px-1 text-sm font-medium transition-colors duration-200 hover:text-foreground cursor-pointer',
              mainTab === 'saved' ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>Việc làm đã lưu</span>
              {mainTab === 'saved' && totalItems > 0 && (
                <span className="ml-1 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  {totalItems}
                </span>
              )}
            </div>
          </button>

          <div
            className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-500 ease-out"
            style={{
              left: `${underlineStyle.left}px`,
              width: `${underlineStyle.width}px`,
            }}
          />
        </div>
      </div>

      <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
        {mainTab === 'applied' ? (
          <>
            {isLoadingMyJobs ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <LoaderSpin />
              </div>
            ) : isErrorMyJobs ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <FileX className="h-16 w-16 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Không thể tải danh sách đơn ứng tuyển</p>
              </div>
            ) : myJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Briefcase className="h-16 w-16 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Chưa có đơn ứng tuyển nào</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myJobs.map((application) => (
                    <ApplicationCard
                      key={(application as Application).applicationId}
                      application={application as Application}
                      downloadResume={handleDownloadResume}
                      isDownloading={isDownloading}
                    />
                  ))}
                </div>

                <CustomPagination
                  currentPage={page}
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
          </>
        ) : (
          <>
            {isLoadingMyJobs ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <LoaderSpin />
              </div>
            ) : isErrorMyJobs ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <FileX className="h-16 w-16 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Không thể tải danh sách việc làm đã lưu</p>
              </div>
            ) : myJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Bookmark className="h-16 w-16 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Chưa có việc làm nào được lưu</p>
                <p className="text-sm text-muted-foreground">Hãy khám phá và lưu các công việc phù hợp với bạn</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myJobs.map((job) => (
                    <SavedJobCard key={(job as Job).jobId} job={job as Job} />
                  ))}
                </div>

                <CustomPagination
                  currentPage={page}
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
          </>
        )}
      </div>
    </div>
  );
}
