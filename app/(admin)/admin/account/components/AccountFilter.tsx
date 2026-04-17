'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { AccountFilterType } from '../hooks/useAccountManagement';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { ROLE_LIST } from '@/constants/constant';

interface AccountFilterProps {
  readonly filters: AccountFilterType;
  readonly onFilterChange: (filters: Partial<AccountFilterType>) => void;
  readonly onResetFilters: () => void;
}

export function AccountFilter({ filters, onFilterChange, onResetFilters }: AccountFilterProps) {
  const [email, setEmail] = useState(filters.email || '');

  // Debounce search for email
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedEmailSearch = useCallback(
    debounce((value: string) => {
      onFilterChange({ email: value });
    }, 500),
    [],
  );

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    debouncedEmailSearch(value);
  };

  // Sync local state with filters prop
  useEffect(() => {
    if (filters.email !== email) setEmail(filters.email || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.email]);

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo email..."
            className="pl-9 rounded-xl"
            value={email}
            onChange={handleEmailChange}
          />
        </div>

        <Select
          value={filters.role || 'all'}
          onValueChange={(value) => onFilterChange({ role: value == 'all' ? undefined : value })}
        >
          <SelectTrigger className="rounded-xl w-full">
            <SelectValue placeholder="Vai trò..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            {ROLE_LIST.map((role) => {
              return (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select
          value={filters.enabled === undefined ? 'all' : filters.enabled.toString()}
          onValueChange={(value) =>
            onFilterChange({
              enabled: value === 'all' ? undefined : value == 'true',
            })
          }
        >
          <SelectTrigger className="rounded-xl w-full">
            <SelectValue placeholder="Trạng thái..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="true">Đã kích hoạt</SelectItem>
            <SelectItem value="false">Chưa kích hoạt</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.locked === undefined ? 'all' : filters.locked.toString()}
          onValueChange={(value) =>
            onFilterChange({
              locked: value === 'all' ? undefined : value == 'true',
            })
          }
        >
          <SelectTrigger className="rounded-xl w-full">
            <SelectValue placeholder="Trạng thái..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="true">Đã khóa</SelectItem>
            <SelectItem value="false">Chưa khóa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button
          variant="destructive"
          className="rounded-xl"
          onClick={() => {
            setEmail('');
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
