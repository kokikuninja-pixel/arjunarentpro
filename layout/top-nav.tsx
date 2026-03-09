'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFilteredNavigation } from '@/features/auth/hooks/use-navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function TopNav() {
  const pathname = usePathname();
  const { navItems, loading } = useFilteredNavigation();
  const { selectedBranchId } = useAuth();

  if (loading) {
    return (
      <nav className="hidden md:flex items-center gap-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const isGlobalLink = item.scope === 'owner';
        const href = isGlobalLink ? item.href : (selectedBranchId ? `/${selectedBranchId}${item.href}` : '#');
        const isActive = pathname.startsWith(href);
        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
          return (
            <DropdownMenu key={item.name}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="gap-1"
                  disabled={!isGlobalLink && !selectedBranchId}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {item.children!.map((child) => {
                  const childHref = isGlobalLink ? child.href : (selectedBranchId ? `/${selectedBranchId}${child.href}` : '#');
                  const isChildActive = pathname === childHref;
                  
                  return (
                    <DropdownMenuItem key={child.href} asChild>
                      <Link
                        href={childHref}
                        className={cn(
                          'flex items-center gap-2',
                          isChildActive && 'bg-accent'
                        )}
                      >
                        <child.icon className="w-4 h-4" />
                        {child.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <Button
            key={item.name}
            variant={isActive ? 'secondary' : 'ghost'}
            asChild
            disabled={!isGlobalLink && !selectedBranchId}
          >
            <Link href={href} className="flex items-center gap-2">
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}