'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { BranchSwitcher } from './branch-switcher';
import { UserNav } from './user-nav';
import { TopNav } from './TopNav';
import { MobileNav } from './MobileNav';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { selectedBranchId, role } = useAuth();
  const [open, setOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-2 md:gap-4">
              <MobileNav />
              
              {/* Logo */}
              <Link href={role === 'owner' || role === 'developer' ? '/owner/dashboard' : (selectedBranchId ? `/${selectedBranchId}/dashboard` : '/')} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <span className="font-bold text-foreground text-lg hidden sm:inline-block">MotoRent</span>
              </Link>
              
              {/* Main Navigation for Desktop */}
              <TopNav />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <BranchSwitcher />
              <UserNav />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
