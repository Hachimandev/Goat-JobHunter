import { useFetchJobsAvailableQuery, useFetchJobSubscribersByCurrentUserQuery, useFetchRelatedJobsByCurrentUserQuery } from '@/services/job/jobApi';
import { useGetAllSkillsQuery } from '../services/skill/skillApi';
import { useCallback, useMemo, useState } from 'react';
import { useUser } from '@/hooks/useUser';

export interface JobFilters {
  provinces?: string[];
  skills?: string[];
  level?: string[];
  workingType?: string[];
  activeTab?: 'all' | 'subscribers' | 'recommended';
}

export interface UseJobsFilterOptions {
  initialPage?: number;
  itemsPerPage?: number;
  initialFilters?: JobFilters;
}

export const useJobsFilter = (options?: UseJobsFilterOptions) => {
  const { initialPage = 1, itemsPerPage = 10, initialFilters = {} } = options || {};
  const { isSignedIn, user } = useUser();

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState<JobFilters>({
    ...initialFilters,
    activeTab: initialFilters.activeTab || 'all',
  });
  const [skillInputValue, setSkillInputValue] = useState<string>('');
  const [debouncedSkillInput, setDebouncedSkillInput] = useState<string>('');

  // Create debounce function
  const [debounceFunc] = useState(() => {
    let timeoutId: any = null;
    return (value: string) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDebouncedSkillInput(value);
      }, 500);
    };
  });

  // Handle skill input value change
  const handleSkillInputChange = (value: string) => {
    setSkillInputValue(value);
    debounceFunc(value);
  };

  // Fetch skills from API
  const { data: skillsData, isFetching: isFetchingSkills } = useGetAllSkillsQuery(
    {
      name: debouncedSkillInput,
    },
    {
      skip: !debouncedSkillInput && debouncedSkillInput.length < 2 && filters.skills?.length === 0,
    },
  );

  // Convert API skills to map for easy lookup (name -> id)
  const skillNameToIdMap = useMemo(() => {
    const map = new Map<string, number>();
    skillsData?.data?.result?.forEach((skill: any) => {
      map.set(skill.name, skill.skillId);
    });
    return map;
  }, [skillsData]);

  // Build query params matching FetchJobsRequest
  const queryParams = useMemo(() => {
    const params: Record<string, string | number | string[] | boolean | number[]> = {
      page: currentPage,
      size: itemsPerPage,
    };

    if (filters.provinces && filters.provinces.length > 0) {
      params.provinces = filters.provinces;
    }

    if (filters.level && filters.level.length > 0) {
      params.level = filters.level;
    }

    if (filters.workingType && filters.workingType.length > 0) {
      params.workingType = filters.workingType;
    }

    if (filters.skills && filters.skills.length > 0) {
      const skillIds = filters.skills
        .map((skillName) => skillNameToIdMap.get(skillName))
        .filter((id): id is number => id !== undefined);

      if (skillIds.length > 0) {
        params.skills = skillIds;
      }
    }

    return params;
  }, [currentPage, itemsPerPage, filters, skillNameToIdMap]);

  const {
    data: allJobsResponse,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
    isError: isErrorAll,
    error: errorAll,
  } = useFetchJobsAvailableQuery(queryParams, {
    skip: filters.activeTab !== 'all',
  });

  const {
    data: subscribersJobsResponse,
    isLoading: isLoadingSubscribers,
    isFetching: isFetchingSubscribers,
    isError: isErrorSubscribers,
    error: errorSubscribers,
  } = useFetchJobSubscribersByCurrentUserQuery(queryParams, {
    skip: filters.activeTab !== 'subscribers' || !user || !isSignedIn,
  });

  const {
    data: recommendedJobsResponse,
    isLoading: isLoadingRecommended,
    isFetching: isFetchingRecommended,
    isError: isErrorRecommended,
    error: errorRecommended,
  } = useFetchRelatedJobsByCurrentUserQuery(queryParams, {
    skip: filters.activeTab !== 'recommended' || !user || !isSignedIn,
  });

  const jobsResponse =
    filters.activeTab === 'all'
      ? allJobsResponse
      : filters.activeTab === 'subscribers'
        ? subscribersJobsResponse
        : recommendedJobsResponse;

  const isLoading =
    filters.activeTab === 'all'
      ? isLoadingAll
      : filters.activeTab === 'subscribers'
        ? isLoadingSubscribers
        : isLoadingRecommended;

  const isFetching =
    filters.activeTab === 'all'
      ? isFetchingAll
      : filters.activeTab === 'subscribers'
        ? isFetchingSubscribers
        : isFetchingRecommended;

  const isError =
    filters.activeTab === 'all'
      ? isErrorAll
      : filters.activeTab === 'subscribers'
        ? isErrorSubscribers
        : isErrorRecommended;

  const error =
    filters.activeTab === 'all' ? errorAll : filters.activeTab === 'subscribers' ? errorSubscribers : errorRecommended;

  // Extract data from response
  const jobs = jobsResponse?.data?.result || [];
  const meta = jobsResponse?.data?.meta || {
    page: 0,
    pageSize: itemsPerPage,
    pages: 0,
    total: 0,
  };

  const totalPages = meta.pages;
  const totalItems = meta.total;

  // Filter handlers
  const handleFilterChange = (newFilters: Partial<JobFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      level: [],
      skills: [],
      provinces: [],
      workingType: [],
      activeTab: options?.initialFilters?.activeTab || 'all',
    });
    setCurrentPage(1);
    setSkillInputValue('');
    setDebouncedSkillInput('');
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Active filters count
  const activeFiltersCount = Object.entries(filters)
    .filter(([key, value]) => {
      if (key === 'activeTab') return false;
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== '';
    }).length;

  return {
    // Data
    jobs,
    meta,
    totalPages,
    totalItems,
    currentPage,
    itemsPerPage,

    // Loading states
    isLoading,
    isFetching,
    isError,
    error,

    // Filters
    filters,
    handleFilterChange,
    resetFilters,
    activeFiltersCount,

    // Pagination
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,

    // Skills
    skillsData: skillsData?.data?.result || [],
    isFetchingSkills,
    skillInputValue,
    handleSkillInputChange,
  };
};

export default useJobsFilter;
