'use client';

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAV_LINKS_CONFIG } from '@/lib/config';
import type { NavLink, UserRole } from '@/lib/config';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { PermissionGuard } from "@/features/auth/components";

interface MobileNavProps {
  setOpen: (open: boolean) => void;
}

export function MobileNav({ setOpen }: MobileNavProps) {
  const { role, loading, selectedBranchId } = useAuth();

  if (loading || !role) {
    return (
        <div className="p-4 space-y-3">
            {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
    );
  }

  const links: NavLink[] = NAV_LINKS_CONFIG[role as UserRole] || [];
  
  return (
    <>
        <Link
            href="/"
            className="flex items-center gap-2 p-4 border-b -ml-6 -mt-6 mb-4"
            onClick={() => setOpen(false)}
        >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center ml-6">
                <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold">MotoRent</span>
        </Link>
        <ScrollArea className="h-[calc(100vh-8rem)] -mr-6 pr-6">
            <div className="flex flex-col space-y-2">
            {links.map((item, index) => {
                 const isGlobalLink = item.scope === 'owner';
                 const href = isGlobalLink ? item.href : (selectedBranchId ? `/${selectedBranchId}${item.href}` : '#');
                 
                 return (
                    <PermissionGuard key={index} permission={item.permission} fallback={null}>
                      <Link
                          href={href}
                          className={cn(
                              "flex items-center gap-3 rounded-md p-3 text-sm font-medium hover:bg-muted",
                              item.scope !== 'owner' && !selectedBranchId ? 'pointer-events-none opacity-60' : ''
                          )}
                          onClick={() => href !== '#' && setOpen(false)}
                      >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                      </Link>
                    </PermissionGuard>
                 )
            })}
            </div>
        </ScrollArea>
    </>
  );
}
