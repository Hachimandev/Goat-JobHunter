import { Star } from "lucide-react";

export default function StarRating({ rating }: { readonly rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${star <= Math.round(rating) ? "fill-[#ff9119] text-[#ff9119]" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}
