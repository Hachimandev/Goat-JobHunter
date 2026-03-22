'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Building2, MessageCircleMore } from 'lucide-react';
import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Trang chủ', href: '/', icon: <Home size={20} /> },
  { id: 'jobs', label: 'Việc làm', href: '/jobs', icon: <Briefcase size={20} /> },
  { id: 'companies', label: 'Công ty', href: '/companies', icon: <Building2 size={20} /> },
  { id: 'messages', label: 'Tin nhắn', href: '/messages', icon: <MessageCircleMore size={20} /> },
];

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="w-[8vw] min-w-12 max-w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 shadow-sm">
        <div className="flex-1 flex flex-col gap-2 w-full px-1.5">
          {navItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center justify-center w-full aspect-square rounded-full transition-all',
                    isActive(item.href) ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {item.icon}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </nav>
    </TooltipProvider>
  );
}
