"use client";

import { RatingItem } from "@/services/review/reviewType";
import { useMemo, useState } from "react";
import StarRating from "../StarRating";
import RatingBar from "../RatingBar";
import CircularProgress from "../CircularProgress";
import { ChevronDown, ChevronUp } from "lucide-react";
import CategoryRatingItem from "../CategoryRatingItem";
import { useReviewFilter } from "../../hooks/useReviewFilter";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import CustomPagination from "@/components/common/CustomPagination";
import LoaderSpin from "@/components/common/LoaderSpin";
import ReviewCard from "../ReviewCard";

interface ReviewTabProps {
  companyName: string;
  ratingSummary: Record<string, RatingItem>;
  recommendedPercentage: number;
  totalReviews: number;
}

export default function ReviewTab({
  companyName,
  ratingSummary,
  recommendedPercentage,
  totalReviews
}: Readonly<ReviewTabProps>) {
  const [showDetails, setShowDetails] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const {
    reviews,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isError
  } = useReviewFilter({
    initialPage: 1,
    itemsPerPage: 10,
    initialFilters: {
      companyName: companyName
    }
  });

  const overallStats = useMemo(() => {
    const overallRating = ratingSummary
      ? Object.entries(ratingSummary).find(([key]) => key === "Đánh giá chung")?.[1] || {
      average: 0,
      distribution: {}
    }
      : { average: 0, distribution: {} };

    const categories = Object.entries(ratingSummary)
      .filter(([key]) => key !== "Đánh giá chung")
      .map(([label, data]) => ({
        label,
        average: data.average.toFixed(1),
        distribution: Object.entries(data.distribution)
          .sort(([starA], [starB]) => Number(starB) - Number(starA))
          .map(([star, percentage]) => ({
            star: Number(star),
            percentage: percentage
          }))
      }));

    return {
      recommend: Math.round(recommendedPercentage),
      average: overallRating.average.toFixed(1),
      distribution: Object.entries(overallRating.distribution)
        .sort(([starA], [starB]) => Number(starB) - Number(starA))
        .map(([star, percentage]) => ({
          star: Number(star),
          percentage: percentage
        })),
      categories
    };
  }, [ratingSummary, recommendedPercentage]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="p-6">
          <div className="pb-6 border-b border-gray-300 border-dashed">
            <h3 className="text-xl font-bold text-gray-900">Đánh giá chung</h3>
          </div>
          <div
            className="flex flex-col md:flex-row py-6 border-b border-dashed border-gray-300 gap-5 items-center justify-between">
            <div className="flex flex-col items-center justify-center md:items-center min-w-[140px] gap-2">
              <div className="text-[42px] font-bold text-gray-900 leading-none">
                {overallStats.average}
              </div>
              <div className="mb-1">
                <StarRating rating={Number(overallStats.average)} />
              </div>
              <p className="text-[16px] text-gray-900 font-bold">{totalReviews} đánh giá</p>
            </div>

            <div className="w-70 max-w-sm border-r border-dashed border-gray-300 pr-6">
              {overallStats.distribution.map((item) => (
                <RatingBar key={item.star} star={item.star} percentage={item.percentage} />
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 min-w-[300px] mt-4 md:mt-0 pt-4 md:pt-0">
              <CircularProgress percentage={overallStats.recommend} />
              <span className="text-[16px] text-gray-900 font-bold leading-tight max-w-[120px]">
                  Khuyến khích làm việc tại đây
              </span>
            </div>
          </div>

          {overallStats.categories.length > 0 && (
            <div
              className="overflow-hidden"
              style={{
                maxHeight: showDetails ? "2000px" : "0",
                opacity: showDetails ? 1 : 0,
                marginTop: showDetails ? "24px" : "0",
                transform: showDetails ? "translateY(0)" : "translateY(-30px)",
                transition: showDetails
                  ? "max-height 600ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 600ms cubic-bezier(0.4, 0.0, 0.2, 1), margin-top 600ms cubic-bezier(0.4, 0.0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0.0, 0.2, 1)"
                  : "max-height 400ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0.0, 0.2, 1), margin-top 400ms cubic-bezier(0.4, 0.0, 0.2, 1), transform 350ms cubic-bezier(0.4, 0.0, 0.2, 1)"
              }}
            >
              <div className="flex flex-col lg:flex-row border rounded-xl border-gray-200">
                <div className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-200 p-2">
                  {overallStats.categories.map((cat, idx) => (
                    <CategoryRatingItem
                      key={cat.label}
                      label={cat.label}
                      average={cat.average}
                      active={idx === activeCategoryIndex}
                      onMouseEnter={() => setActiveCategoryIndex(idx)}
                    />
                  ))}
                </div>

                <div className="lg:w-[320px] shrink-0 p-5 bg-white items-center justify-center">
                  <h3 className="font-bold text-gray-900 mb-4 text-[16px]">Đánh giá chi tiết</h3>
                  <div className="space-y-3">
                    {overallStats.categories[activeCategoryIndex].distribution.map((d) => (
                      <RatingBar key={d.star} star={d.star} percentage={d.percentage} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {overallStats.categories.length > 0 && (
          <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b text-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-900 font-bold text-[16px] hover:text-primary flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              {showDetails ? "Thu gọn" : "Xem thêm"}
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <LoaderSpin />
          </div>
        )}

        {isError && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Có lỗi xảy ra</EmptyTitle>
              <EmptyDescription>Không thể tải danh sách đánh giá. Vui lòng thử lại sau.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!isLoading && !isError && reviews.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Không tìm thấy đánh giá</EmptyTitle>
              <EmptyDescription>Không tìm thấy đánh giá nào khớp với công ty</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!isLoading && !isError && reviews.length > 0 && (
          <div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-6">
              <div className="p-6">
                <div className="pb-6 border-b border-gray-300 border-dashed">
                  <h3 className="text-xl font-bold text-gray-900">{totalReviews} đánh giá</h3>
                </div>
                {reviews.map((review) => (
                  <ReviewCard key={review.reviewId} review={review} />
                ))}
              </div>
            </div>

            {!isLoading && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
