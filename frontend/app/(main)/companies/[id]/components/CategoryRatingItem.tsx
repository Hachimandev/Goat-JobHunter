import StarRating from "./StarRating";

interface CategoryRatingItemProps {
  label: string;
  average: string;
  active: boolean;
  onMouseEnter: () => void;
}

export default function CategoryRatingItem({
  label,
  average,
  active,
  onMouseEnter
}: Readonly<CategoryRatingItemProps>) {
  return (
    <button
      onMouseEnter={onMouseEnter}
      className={`relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 px-3 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
        active ? "bg-white" : "hover:bg-gray-50"
      }`}
    >
      {active && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-sm"></div>}
      <span className={`text-[16px] pl-2 ${active ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
        {label}
      </span>
      <div className="flex items-center gap-3 shrink-0 pl-2 sm:pl-0">
        <StarRating rating={Math.round(Number(average))} />
        <span className="font-bold text-gray-900 w-6 text-right text-[16px]">{average}</span>
      </div>
    </button>
  );
}
