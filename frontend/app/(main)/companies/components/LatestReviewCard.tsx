"use client";

import { Review } from "@/types/model";
import { getTimeLabel } from "@/utils/formatDate";
import { slugify } from "@/utils/slug";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface LatestReviewCardProps {
  readonly review: Review;
}

export default function LatestReviewCard({ review }: LatestReviewCardProps) {
  const [logoError, setLogoError] = useState(false);
  const hasValidLogo = review.company?.logo && review.company.logo.trim() !== "";

  const daysSince = getTimeLabel(review.createdAt);

  return (
    <Link href={`/companies/${slugify(review.company?.name || "")}`} className="h-full">
      <div
        className="h-full flex flex-col overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer p-4 border rounded-lg bg-white mb-6">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-lg bg-white shadow flex items-center justify-center overflow-hidden shrink-0 border">
              {hasValidLogo && !logoError ? (
                <Image
                  src={review.company.logo}
                  alt={`${review.company.name} logo`}
                  className="w-full h-full object-cover"
                  width={80}
                  height={80}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <span className="text-2xl font-bold text-muted-foreground">
                                        {review.company?.name?.charAt(0).toUpperCase() || "?"}
                                    </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex items-center">
              <h3 className="font-bold text-lg line-clamp-2">{review.company?.name}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={`h-5 w-5 ${
                    index < (review.rating.overall || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-none text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {review.summary && <p className="text-lg text-black line-clamp-2">{review.summary}</p>}

          <div className="text-sm font-medium text-muted-foreground mt-auto">{daysSince}</div>
        </div>
      </div>
    </Link>
  );
}
