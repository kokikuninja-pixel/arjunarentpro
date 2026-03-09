'use client';

import { BranchGuard } from '@/features/auth/components/branch-guard';

export default function BranchSpecificLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The parent layout `(branch)/layout.tsx` already handles AppLayout and ProtectedRoute.
  // This layout just adds the branch-specific guard.
  return (
    <BranchGuard>
      {children}
    </BranchGuard>
  );
}
