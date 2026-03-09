
'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, loading, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // CORRECTED LOGIC: Check for onboarding completion timestamp.
    // This correctly handles global roles like OWNER that don't have a branchId.
    if (!userProfile?.onboardingCompletedAt && pathname !== '/onboarding') {
      router.push('/onboarding');
      return;
    }

    // Redirect from onboarding page if profile is already complete.
    if (userProfile?.onboardingCompletedAt && pathname === '/onboarding') {
       if (userProfile.primaryRoleCode === 'OWNER' || userProfile.primaryRoleCode === 'DEVELOPER') {
          router.replace('/owner/dashboard');
      } else if (userProfile.branchId) {
          router.replace(`/${userProfile.branchId}/dashboard`);
      }
      return;
    }

    // Role-based access check
    if (allowedRoles && userProfile?.primaryRoleCode && !allowedRoles.includes(userProfile.primaryRoleCode.toLowerCase())) {
       // Handled by the guard, but can also redirect here if needed
    }

  }, [isAuthenticated, loading, userProfile, router, pathname, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (allowedRoles && userProfile?.primaryRoleCode && !allowedRoles.includes(userProfile.primaryRoleCode.toLowerCase()))) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <h2 className="text-xl font-bold">Akses Ditolak</h2>
            <p className="text-muted-foreground">Anda tidak memiliki izin untuk melihat halaman ini.</p>
        </div>
    );
  }

  return <>{children}</>;
}
