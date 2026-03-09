'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { NAV_LINKS_CONFIG } from '@/lib/config';
import type { NavLink, UserRole } from '@/lib/config';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { PermissionGuard } from '@/features/auth/components';

export function TopNav() {
  const { role, loading, selectedBranchId } = useAuth();
  const pathname = usePathname();
  
  if (loading || !role) {
    return (
        <div className="hidden md:flex items-center gap-4">
            {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-6 w-20" />)}
        </div>
    );
  }

  const links: NavLink[] = NAV_LINKS_CONFIG[role.toLowerCase() as UserRole] || [];
  
  return (
    <nav className="hidden md:flex items-center gap-2">
      {links.map((link) => {
        const isGlobalLink = link.scope === 'owner';
        const href = isGlobalLink ? link.href : (selectedBranchId ? `/${selectedBranchId}${link.href}` : '#');
        const isActive = pathname === href;

        return (
          <PermissionGuard key={link.href} permission={link.permission} fallback={null}>
            <Link
              href={href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground",
                !selectedBranchId && !isGlobalLink && "pointer-events-none opacity-50"
              )}
            >
              {link.name}
            </Link>
          </PermissionGuard>
        );
      })}
    </nav>
  );
}
