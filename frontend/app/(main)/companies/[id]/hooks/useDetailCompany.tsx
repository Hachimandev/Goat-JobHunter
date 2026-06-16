import { useUser } from '@/hooks/useUser';
import {
    useFetchAvailableJobsByCompanyQuery,
    useFetchCompanyByNameQuery,
    useFetchGroupedAddressesByCompanyQuery,
    useFetchSkillsByCompanyQuery,
} from '@/services/company/companyApi';
import { useCountAvailableJobsByCompanyQuery } from '@/services/job/jobApi';
import {
    useCalculateRecommendedPercentageByCompanyQuery,
    useCountReviewsByCompanyQuery,
    useGetRatingByCompanyQuery,
} from '@/services/review/reviewApi';
import { useCheckSavedJobsQuery } from '@/services/user/savedJobsApi';
import { useCheckCompaniesFollowedQuery, useCheckReviewedCompaniesQuery } from '@/services/user/userApi';
import { MeResponse } from '@/types/dto';
import { isCompanyResponse } from '@/utils/slug';
import { skipToken } from '@reduxjs/toolkit/query';
import { useMemo } from 'react';

const useDetailCompany = (name: string) => {
    const { user, isSignedIn } = useUser();
    const { data: company, isError, isLoading } = useFetchCompanyByNameQuery(name);
    const companyId = company?.data?.accountId;

    const { data: groupedAddresses } = useFetchGroupedAddressesByCompanyQuery(companyId ?? skipToken);
    const { data: countJobs } = useCountAvailableJobsByCompanyQuery(undefined, {
        skip: !companyId,
    });
    const { data: countReviews } = useCountReviewsByCompanyQuery(undefined, {
        skip: !companyId,
    });
    const { data: skillsResponse } = useFetchSkillsByCompanyQuery(companyId ?? skipToken);
    const { data: ratingByCompany } = useGetRatingByCompanyQuery(companyId ?? skipToken);
    const { data: recommendedPercentageResponse } = useCalculateRecommendedPercentageByCompanyQuery(
        companyId ?? skipToken,
    );
    const {
        data: jobsResponse,
        isLoading: isLoadingJobs,
        isError: isErrorJobs,
    } = useFetchAvailableJobsByCompanyQuery(
        { companyId: companyId ?? 0 },
        {
            skip: !companyId,
        },
    );

    const citiesArray = useMemo(
        () => (groupedAddresses?.data ? Object.keys(groupedAddresses.data) : []),
        [groupedAddresses],
    );

    const { data: checkSavedJobsData } = useCheckSavedJobsQuery(
        {
            jobIds: jobsResponse?.data?.map((job) => job.jobId) || [],
        },
        {
            skip: !jobsResponse || jobsResponse.data?.length === 0 || !user || !isSignedIn,
        },
    );
    const savedJobs = useMemo(() => checkSavedJobsData?.data || [], [checkSavedJobsData]);

    const { data: checkFollowedData, isSuccess: isSuccessFollowed } = useCheckCompaniesFollowedQuery(
        {
            companyIds: companyId ? [companyId] : [],
        },
        { skip: !companyId || !user || !isSignedIn },
    );
    const isFollowed = useMemo(() => {
        if (checkFollowedData && isSuccessFollowed) {
            return checkFollowedData.data?.find((followed) => followed.companyId === companyId)?.result || false;
        }
    }, [companyId, checkFollowedData, isSuccessFollowed]);

    const { data: checkReviewedData, isSuccess: isSuccessReviewed } = useCheckReviewedCompaniesQuery(
        {
            companyIds: companyId ? [companyId] : [],
        },
        { skip: !companyId || !user || !isSignedIn || isCompanyResponse(user as MeResponse) },
    );
    const isReviewed = useMemo(() => {
        if (checkReviewedData && isSuccessReviewed) {
            return checkReviewedData.data?.find((reviewed) => reviewed.companyId === companyId)?.result || false;
        }
    }, [companyId, checkReviewedData, isSuccessReviewed]);

    return {
        user,
        isSignedIn,

        company: company?.data,
        skills: skillsResponse?.data || [],
        jobs: jobsResponse?.data || [],
        citiesArray,
        totalJobs: company?.data?.accountId ? countJobs?.data?.[company?.data?.accountId] || 0 : 0,
        totalReviews: company?.data?.accountId ? countReviews?.data?.[company?.data?.accountId] || 0 : 0,
        ratingSummary: ratingByCompany?.data?.ratings || {},
        recommendedPercentage: recommendedPercentageResponse?.data,

        savedJobs,
        isFollowed,
        isReviewed,

        isError,
        isLoading,
        isLoadingJobs,
        isErrorJobs,
    };
};

export default useDetailCompany;
