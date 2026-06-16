import { Star } from "lucide-react";
import { useState } from "react";

interface InteractiveStarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export default function InteractiveStarRating({ value, onChange }: Readonly<InteractiveStarRatingProps>) {
  const [hoverValue, setHoverValue] = useState(0);

  const ratingLabels: Record<number, string> = {
    1: "Rất tệ",
    2: "Cần cải thiện",
    3: "Trung lập",
    4: "Tốt",
    5: "Xuất sắc"
  };

  const currentLabel = ratingLabels[hoverValue || value];

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="transition-transform hover:scale-110 hover:cursor-pointer"
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hoverValue || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-gray-300"
              } transition-colors`}
            />
          </button>
        ))}
      </div>
      {currentLabel && <span className="text-[16px] font-medium min-w-[180px]">{currentLabel}</span>}
    </div>
  );
}
