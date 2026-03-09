"use client";

import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function OwnerLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const allowedRoles = ['owner', 'developer'];

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <AppLayout>
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
}
