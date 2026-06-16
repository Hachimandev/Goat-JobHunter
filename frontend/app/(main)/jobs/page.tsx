'use client';

import { JobFilter, JobList } from '@/app/(main)/jobs/components';
import useJobsFilter from '@/app/(main)/jobs/hooks/useJobsFilter';
import CustomPagination from '@/components/common/CustomPagination';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Briefcase, Sparkles, Users } from 'lucide-react';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useCheckSavedJobsQuery } from '@/services/user/savedJobsApi';
import { useUser } from '@/hooks/useUser';
import { useSearchParams } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JobDetailView } from '@/app/(main)/jobs/[id]/components';

export default function JobsPage() {
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState('all');
  const [manuallySelectedJob, setManuallySelectedJob] = useState<number | null>(null);
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const searchParams = useSearchParams();
  const initLevel = useMemo(
    () => (searchParams.get('level') ? [searchParams.get('level') as string] : []),
    [searchParams],
  );
  const initWorkingType = useMemo(
    () => (searchParams.get('workingType') ? [searchParams.get('workingType') as string] : []),
    [searchParams],
  );
  const initSkills = useMemo(
    () => (searchParams.get('skills') ? [searchParams.get('skills') as string] : []),
    [searchParams],
  );

  const { user, isSignedIn } = useUser();
  const {
    jobs,
    isLoading,
    isFetching,
    isError,
    filters,
    handleFilterChange,
    resetFilters,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    activeFiltersCount,

    skillsData,
    isFetchingSkills,
    skillInputValue,
    handleSkillInputChange,
  } = useJobsFilter({
    itemsPerPage,
    initialFilters: {
      provinces: [],
      skills: initSkills,
      level: initLevel,
      workingType: initWorkingType,
      activeTab: activeTab as 'all' | 'subscribers' | 'recommended',
    },
  });

  useEffect(() => {
    const skillParam = searchParams.get('skills');
    const levelParam = searchParams.get('level');
    const workingTypeParam = searchParams.get('workingType');

    const newSkills = skillParam ? [skillParam] : [];
    const newLevel = levelParam ? [levelParam] : [];
    const newWorkingType = workingTypeParam ? [workingTypeParam] : [];

    if (
      JSON.stringify(filters.skills) !== JSON.stringify(newSkills) ||
      JSON.stringify(filters.level) !== JSON.stringify(newLevel) ||
      JSON.stringify(filters.workingType) !== JSON.stringify(newWorkingType)
    ) {
      handleFilterChange({
        ...filters,
        skills: newSkills,
        level: newLevel,
        workingType: newWorkingType,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (filters.activeTab !== activeTab) {
      handleFilterChange({
        ...filters,
        activeTab: activeTab as 'all' | 'subscribers' | 'recommended',
      });
    }
  }, [activeTab]);

  const { data: checkSavedJobsData } = useCheckSavedJobsQuery(
    {
      jobIds: jobs.map((job) => job.jobId),
    },
    {
      skip: !jobs || jobs.length === 0 || !user || !isSignedIn,
    },
  );

  const savedJobs = useMemo(() => checkSavedJobsData?.data || [], [checkSavedJobsData]);

  const selectedJob = useMemo(() => {
    if (manuallySelectedJob !== null) {
      return manuallySelectedJob;
    }
    if (!isLoading && jobs.length > 0) {
      return jobs[0].jobId;
    }
    return null;
  }, [manuallySelectedJob, isLoading, jobs]);

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement) {
      setTabIndicator({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <main className="flex-1">
      <section className="relative z-30 border-b border-border bg-primary/5 py-8">
        <div className="max-w-7xl mx-auto lg:px-8 sm:px-6">
          <JobFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
            activeFiltersCount={activeFiltersCount}
            skills={skillsData}
            isFetchingSkills={isFetchingSkills}
            skillInputValue={skillInputValue}
            onSkillInputChange={handleSkillInputChange}
          />
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <div className="sticky top-14 z-20 bg-background pb-4 mb-2 flex items-center justify-between">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => {
                    setActiveTab(value);
                    setManuallySelectedJob(null);
                  }}
                  className="w-auto"
                >
                  <TabsList className="bg-transparent p-0 gap-2 h-auto relative">
                    <TabsTrigger
                      ref={(el) => {
                        tabRefs.current['all'] = el;
                      }}
                      value="all"
                      className="gap-2 rounded-full px-4 py-2 cursor-pointer transition-colors duration-200 hover:bg-muted border-0 relative z-10 data-[state=active]:text-primary data-[state=active]:bg-transparent"
                    >
                      <Briefcase className="h-4 w-4" />
                      Tất cả
                    </TabsTrigger>
                    {isSignedIn && (
                      <>
                        <TabsTrigger
                          ref={(el) => {
                            tabRefs.current['subscribers'] = el;
                          }}
                          value="subscribers"
                          className="gap-2 rounded-full px-4 py-2 cursor-pointer transition-colors duration-200 hover:bg-muted border-0 relative z-10 data-[state=active]:text-primary data-[state=active]:bg-transparent"
                        >
                          <Users className="h-4 w-4" />
                          Đăng ký
                        </TabsTrigger>
                        <TabsTrigger
                          ref={(el) => {
                            tabRefs.current['recommended'] = el;
                          }}
                          value="recommended"
                          className="gap-2 rounded-full px-4 py-2 cursor-pointer transition-colors duration-200 hover:bg-muted border-0 relative z-10 data-[state=active]:text-primary data-[state=active]:bg-transparent"
                        >
                          <Sparkles className="h-4 w-4" />
                          Đề xuất
                        </TabsTrigger>
                      </>
                    )}
                    <motion.div
                      className="absolute bg-primary/10 rounded-full z-0"
                      animate={{
                        left: tabIndicator.left,
                        width: tabIndicator.width,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                      style={{
                        height: '100%',
                        top: 0,
                      }}
                    />
                  </TabsList>
                </Tabs>
              </div>

              {(isLoading || isFetching) && (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: itemsPerPage }, () => crypto.randomUUID()).map((key) => (
                    <Skeleton key={key} className="h-64 rounded-xl" />
                  ))}
                </div>
              )}

              {isError && (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Có lỗi xảy ra</EmptyTitle>
                    <EmptyDescription>Không thể tải danh sách công việc. Vui lòng thử lại sau.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}

              {!isLoading && !isError && jobs.length === 0 && (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Không tìm thấy việc làm</EmptyTitle>
                    <EmptyDescription>Không tìm thấy việc làm nào khớp với yêu cầu của bạn</EmptyDescription>
                  </EmptyHeader>
                  {activeFiltersCount > 0 && (
                    <Button onClick={resetFilters} className={'rounded-xl'}>
                      Xóa bộ lọc
                    </Button>
                  )}
                </Empty>
              )}

              {!isLoading && !isError && jobs.length > 0 && (
                <JobList
                  jobs={jobs}
                  savedJobs={savedJobs}
                  viewMode="list"
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onJobClick={setManuallySelectedJob}
                  selectedJobId={selectedJob}
                />
              )}

              {!isLoading && (
                <div className="mt-8">
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
              )}
            </div>

            <div className="hidden lg:block w-[500px] xl:w-[600px] shrink-0">
              {isLoading ? (
                <div className="sticky top-20 rounded-xl border border-border bg-card p-6 h-[calc(100vh-6rem)]">
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">Đang tải...</p>
                    </div>
                  </div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="sticky top-20 rounded-xl border border-border bg-card p-6 h-[calc(100vh-6rem)]">
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">Không có công việc nào</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sticky top-20 rounded-xl border border-border bg-card overflow-hidden h-[calc(100vh-6rem)]">
                  <ScrollArea className="h-full">
                    <JobDetailView jobId={selectedJob} />
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
