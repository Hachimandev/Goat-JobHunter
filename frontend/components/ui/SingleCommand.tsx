'use client';

import * as React from 'react';
import { X } from 'lucide-react';

import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CommandOption {
    value: string;
    label: string;
}

interface SingleCommandSelectProps {
    value?: CommandOption | null;
    options: CommandOption[];
    placeholder?: string;
    emptyText?: string;
    loading?: boolean;
    onChange: (option: CommandOption | null) => void;
    onSearch: (keyword: string) => void;
    className?: string;
}

export function SingleCommand({
    value,
    options,
    placeholder = 'Select...',
    emptyText = 'Không có dữ liệu',
    loading,
    onChange,
    onSearch,
    className,
}: SingleCommandSelectProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                        'w-full justify-between rounded-xl font-normal',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    {value ? value.label : placeholder}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                    <CommandInput onValueChange={onSearch} />
                    <CommandList>
                        {loading && <div className="p-2 text-center text-sm text-muted-foreground">Đang tải...</div>}

                        {!loading && options.length === 0 && <CommandEmpty>{emptyText}</CommandEmpty>}

                        {options.map((option) => {
                            const selected = value?.value === option.value;

                            return (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        onChange(option);
                                        setOpen(false);
                                    }}
                                    className="flex items-center justify-between"
                                >
                                    <span className="truncate">{option.label}</span>

                                    <span className="flex items-center gap-1">
                                        {selected && (
                                            <X
                                                className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onChange(null);
                                                }}
                                            />
                                        )}
                                    </span>
                                </CommandItem>
                            );
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
