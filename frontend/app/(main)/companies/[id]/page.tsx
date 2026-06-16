"use client";

import { useParams } from "next/navigation";
import useDetailCompany from "./hooks/useDetailCompany";
import LoaderSpin from "@/components/common/LoaderSpin";
import ErrorMessage from "@/components/common/ErrorMessage";
import { HeroSection } from "./components";
import { useMemo, useState } from "react";
import { AboutTab, ReviewTab } from "./components/tabs";
import JobList from "./components/JobList";

export default function DetailCompanyPage() {
  const params = useParams<{ id: string }>();
  const {
    company,
    skills,
    jobs,

    citiesArray,
    totalJobs,
    totalReviews,

    ratingSummary,
    recommendedPercentage,

    savedJobs,
    isFollowed,
    isReviewed,

    isError,
    isLoading,
    isLoadingJobs,
    isErrorJobs
  } = useDetailCompany(params.id);

  const tabs: Array<{ id: string; label: string; count: number | null }> = useMemo(
    () => [
      { id: "about", label: "Giới thiệu", count: null },
      { id: "reviews", label: "Đánh giá", count: totalReviews }
    ],
    [totalReviews]
  );

  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  if (!company && (isLoading || isError === false)) {
    return <LoaderSpin />;
  }

  if (!company && isError) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message="Không thể tải thông tin công ty. Vui lòng thử lại sau." />
        </div>
      </main>
    );
  }

  return (
    <div className="flex-1">
      <HeroSection
        company={company!}
        totalJobs={totalJobs}
        citiesArray={citiesArray}
        isFollowed={isFollowed || false}
        isReviewed={isReviewed || false}
      />
      <section className="border-b border-border p-6">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex-1 min-w-0">
            <div className="sticky top-16 z-40 bg-[#f7f7f7] mb-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex gap-8 px-6 overflow-x-auto no-scrollbar">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 border-b-[3px] font-bold text-[16px] whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-900"
                      }`}
                    >
                      {tab.label}
                      {tab.count !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-lg font-bold leading-none ${
                            activeTab === tab.id
                              ? "bg-primary text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {activeTab === "about" && <AboutTab company={company!} skills={skills} />}
            {activeTab === "reviews" && (
              <ReviewTab
                ratingSummary={ratingSummary!}
                recommendedPercentage={recommendedPercentage!}
                totalReviews={totalReviews}
                companyName={params.id}
              />
            )}
          </div>

          <div className="w-full lg:w-[380px] shrink-0">
            <JobList
              jobs={jobs || []}
              isLoading={isLoadingJobs}
              isError={isErrorJobs}
              savedJobs={savedJobs}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
