'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { NAV_LINKS_CONFIG } from '@/lib/config';
import type { NavLink } from '@/lib/config';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Skeleton } from '../ui/skeleton';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function SidebarNav() {
  const { role, loading, selectedBranchId } = useAuth();
  const { isExpanded } = useSidebar();
  const pathname = usePathname();
  
  if (loading || !role) {
    return (
        <div className="flex flex-col gap-2 p-2">
            {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
    );
  }

  const links: NavLink[] = NAV_LINKS_CONFIG[role] || [];
  
  return (
    <SidebarMenu>
      {links.map((link) => {
        const isGlobalLink = link.scope === 'owner';
        let href: string;

        if (isGlobalLink) {
            href = link.href; // Global links have a fixed path, e.g., /branches
        } else {
            // Operational links are dynamic based on the selected branch
            href = selectedBranchId ? `/${selectedBranchId}${link.href}` : '#';
        }

        // Determine if the link is active
        const isActive = pathname === href;

        return (
          <SidebarMenuItem key={link.href + (isGlobalLink ? '' : selectedBranchId)}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={link.label}
              disabled={!selectedBranchId && !isGlobalLink}
            >
              <Link href={href}>
                <link.icon />
                <span className={cn("transition-opacity", !isExpanded && "opacity-0 w-0")}>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
