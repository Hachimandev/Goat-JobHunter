'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { debounce } from 'lodash';
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdminBlogFilters } from '@/app/(admin)/admin/blog/hooks/useBlogAdminManagement';

interface AdminBlogFilterProps {
  filters: AdminBlogFilters;
  onFilterChange: (filters: Partial<AdminBlogFilters>) => void;
  onResetFilters: () => void;
}

export default function AdminBlogFilter({ filters, onFilterChange, onResetFilters }: Readonly<AdminBlogFilterProps>) {
  const [searchTerm, setSearchTerm] = useState(filters.content || '');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onFilterChange({ content: value });
    }, 700),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    if (filters.content !== searchTerm) {
      setSearchTerm(filters.content || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.content]);

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo nội dung..."
            className="pl-9 rounded-xl"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="">
          <Select
            value={filters.enabled === true ? 'enabled' : filters.enabled === false ? 'disabled' : 'all'}
            onValueChange={(value) => {
              const enabled = value === 'enabled' ? true : value === 'disabled' ? false : null;
              onFilterChange({ enabled });
            }}
          >
            <SelectTrigger className="rounded-xl w-full">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="enabled">Đang hiển thị</SelectItem>
              <SelectItem value="disabled">Đang ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant={'destructive'}
          className="rounded-xl"
          onClick={() => {
            setSearchTerm('');
            onResetFilters();
          }}
        >
          <X className="h-4 w-4 mr-2" />
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  );
}
