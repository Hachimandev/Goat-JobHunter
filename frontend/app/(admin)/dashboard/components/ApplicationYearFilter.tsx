import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ApplicationYearFilterProps {
  year: number;
  onYearChange: (year: number) => void;
}

export const ApplicationYearFilter = ({
  year,
  onYearChange,
}: ApplicationYearFilterProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="year-select">Năm:</Label>
      <Select
        value={year.toString()}
        onValueChange={(value) => onYearChange(Number(value))}
      >
        <SelectTrigger id="year-select" className="w-[120px] rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};