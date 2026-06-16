import { Star } from "lucide-react";

interface Props {
  readonly star: number;
  readonly percentage: number;
}

export default function RatingBar({ star, percentage }: Props) {
  return (
    <div className="flex items-center gap-3 text-[16px] text-gray-900 mb-1">
      <div className="flex items-center gap-1 shrink-0 justify-start">
        <span className="font-bold">{star}</span>
        <Star className="w-4 h-4 fill-[#ff9119] text-[#ff9119]" />
      </div>
      <div className="w-70 bg-green-100 rounded-full h-1.5 overflow-hidden">
        <div className="bg-[#ff9119] h-full rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="w-8 text-left text-[16px] text-gray-900 font-bold shrink-0">{percentage}%</span>
    </div>
  );
}
