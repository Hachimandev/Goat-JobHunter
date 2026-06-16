'use client';

import { Company } from '@/types/model';
import { BriefcaseBusiness, MapPin, UserMinus, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import AwardBadge from './AwardBadge';
import useCompanyActions from '@/hooks/useCompanyActions';
import ReviewDialog from './ReviewDialog';
import useReviewActions from '@/hooks/useReviewActions';
import { toast } from 'sonner';
import { isCompanyResponse } from '@/utils/slug';
import { MeResponse } from '@/types/dto';

interface HeroSectionProps {
  company: Company;
  totalJobs: number;
  citiesArray: string[];
  isFollowed: boolean;
  isReviewed: boolean;
}

export default function HeroSection({
  company,
  totalJobs,
  citiesArray,
  isFollowed,
  isReviewed,
}: Readonly<HeroSectionProps>) {
  const { handleToggleFollowCompany, isLoading: isLoadingFollow } = useCompanyActions();
  const { handleCreateReview, isCreating, user } = useReviewActions();

  const [logoError, setLogoError] = useState(false);
  const [localIsFollowed, setLocalIsFollowed] = useState(isFollowed);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const hasValidLogo = company.logo && company.logo.trim() !== '';

  useEffect(() => {
    setLocalIsFollowed(isFollowed);
  }, [isFollowed]);

  const handleFollowClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    if (!user) {
      toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
      return;
    }
    setLocalIsFollowed(!localIsFollowed);
    handleToggleFollowCompany(e, company, localIsFollowed);
  };

  const handleReviewClick = () => {
    if (!user) {
      toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
      return;
    }
    setIsReviewDialogOpen(true);
  };

  return (
    <section className="border-b border-border bg-primary/5 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row items-center xl:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row justify-start w-full xl:w-auto gap-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-white rounded-lg shadow-lg p-1 shrink-0 mx-auto sm:mx-0">
            <div className="w-full h-full flex items-center justify-center">
              {hasValidLogo && !logoError ? (
                <Image
                  src={company.logo}
                  alt={`${company.name} Logo`}
                  className="max-w-full max-h-full object-contain rounded"
                  width={152}
                  height={152}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center rounded">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-muted-foreground">
                    {company.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-4 sm:gap-5">
              <h1 className="text-xl sm:text-2xl md:text-[32px] font-bold text-gray-900 leading-tight text-center sm:text-left">
                {company.name}
              </h1>
              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-6">
                {citiesArray.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm md:text-base text-gray-600 font-normal">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{citiesArray.join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm md:text-base text-gray-600 font-normal">
                  <BriefcaseBusiness className="w-4 h-4 text-gray-400" />
                  <span>{totalJobs} việc làm đang tuyển dụng</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {((user && !isCompanyResponse(user as MeResponse)) || !user) && (
                  <button
                    onClick={handleReviewClick}
                    disabled={isReviewed}
                    className={`${
                      isReviewed ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary/80 cursor-pointer'
                    } text-white font-bold py-2.5 rounded shadow-sm text-[14px] sm:text-[16px] transition-colors whitespace-nowrap w-full sm:w-[150px] md:w-[180px] text-center`}
                  >
                    {isReviewed ? 'Đã đánh giá' : 'Viết đánh giá'}
                  </button>
                )}

                <button
                  onClick={handleFollowClick}
                  disabled={isLoadingFollow}
                  className={`${
                    localIsFollowed
                      ? 'bg-primary hover:bg-primary/80 text-white'
                      : 'bg-white hover:bg-gray-100 text-primary border border-primary'
                  } font-bold py-2.5 rounded shadow-sm text-[14px] sm:text-[16px] transition-colors whitespace-nowrap w-full sm:w-[150px] md:w-[180px] text-center flex items-center justify-center gap-2 ${
                    isLoadingFollow ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  title={localIsFollowed ? 'Bỏ theo dõi' : 'Theo dõi'}
                >
                  {localIsFollowed ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      Bỏ theo dõi
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Theo dõi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        <AwardBadge
          year={company.awards && company.awards.length > 0 ? company.awards[0].year : undefined}
          type={company.awards && company.awards.length > 0 ? company.awards[0].type : undefined}
        />
      </div>

      <ReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        company={company}
        onSubmit={handleCreateReview}
        isLoading={isCreating}
      />
    </section>
  );
}
