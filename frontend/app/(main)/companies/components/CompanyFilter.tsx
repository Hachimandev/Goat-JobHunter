import { Company } from "@/types/model";
import { CompanyFilters } from "../hooks/useCompaniesFilter";
import { useMemo } from "react";
import MultipleSelector, { Option } from "@/components/ui/MultipleSelector";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SingleCommand } from "@/components/ui/SingleCommand";
import { JOBFILTER_CONFIG, PROVINCE_OPTIONS } from "@/constants/constant";
import { toast } from "sonner";

interface CompanyFilterProps {
  filters: CompanyFilters;
  onFilterChange: (filters: Partial<CompanyFilters>) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
  companies: Company[];
  isFetchingCompanies: boolean;
  nameInputValue: string;
  onNameInputChange: (value: string) => void;
}

export default function CompanyFilter({
  filters,
  onFilterChange,
  onResetFilters,
  activeFiltersCount,
  companies,
  isFetchingCompanies,
  nameInputValue,
  onNameInputChange
}: Readonly<CompanyFilterProps>) {
  const companyOptions = useMemo<Option[]>(() => {
    return companies.map((company) => ({
      label: company.name,
      value: company.name
    }));
  }, [companies]);

  const handleAddressChange = (options: Option[]) => {
    onFilterChange({
      addresses: options.map((opt) => opt.value)
    });
  };

  const selectedAddresses: Option[] =
    filters.addresses?.map((address) => ({
      value: address,
      label: address
    })) || [];

  return (
    <div className="bg-white rounded-xl border border-border p-6 mb-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Trải nghiệm về công ty của bạn?
          </p>
          <p className="font-bold">Review ẩn danh của bạn sẽ giúp hàng triệu người đang tìm kiếm việc làm</p>
        </div>
        <Button size="sm" onClick={onResetFilters} disabled={activeFiltersCount === 0} className="rounded-xl">
          <X className="h-4 w-4 mr-2" />
          Xóa bộ lọc ({activeFiltersCount})
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <SingleCommand
          value={nameInputValue ? { label: nameInputValue, value: nameInputValue } : null}
          options={companyOptions}
          onChange={(option) => {
            onNameInputChange(option ? option.value : "");
            onFilterChange({ name: option ? option.value : "" });
          }}
          onSearch={onNameInputChange}
          placeholder="Tên công ty..."
          loading={isFetchingCompanies}
          emptyText="Không tìm thấy công ty"
        />

        <MultipleSelector
          options={PROVINCE_OPTIONS}
          value={selectedAddresses}
          onChange={handleAddressChange}
          placeholder="Chọn địa điểm..."
          emptyIndicator={
            <p className="text-center text-sm text-muted-foreground">Không tìm thấy địa điểm</p>
          }
          className="rounded-xl"
          hidePlaceholderWhenSelected
          maxSelected={JOBFILTER_CONFIG.provinces.maxSelected}
          onMaxSelected={() => {
            toast.error(JOBFILTER_CONFIG.provinces.maxSelectedMessage);
          }}
        />
      </div>
    </div>
  );
}
