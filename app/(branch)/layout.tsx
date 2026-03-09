'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function BranchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // All staff roles can access branch pages. The specific branch access is handled
  // by the nested BranchGuard.
  const allowedRoles = ['admin', 'staff', 'mekanik', 'driver', 'owner', 'developer'];
  
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <AppLayout>
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
}
