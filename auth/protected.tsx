'use client';

import { usePermissions } from '@/features/rbac/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

interface ProtectedProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  resourceData?: any;
}

export function Protected({ 
  children, 
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  resourceData
}: ProtectedProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) {
    return <Skeleton className="h-10 w-full rounded" />;
  }

  const codes = permission ? [permission, ...permissions] : permissions;
  if(codes.length === 0) return <>{children}</>;

  const hasAccess = requireAll 
    ? hasAllPermissions(codes)
    : hasAnyPermission(codes);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}

interface ProtectedActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  permission: string;
  resourceData?: any;
}

export function ProtectedAction({
  children,
  permission,
  onClick,
  disabled,
  className,
  resourceData,
  ...props
}: ProtectedActionProps) {
  const { canAccessResource, loading } = usePermissions();

  if (loading) {
    return <Button disabled className={className}>{children}</Button>;
  }

  const [resource, action] = permission.split('.');
  const canPerform = canAccessResource(
    resource,
    action,
    resourceData
  );

  if (!canPerform) {
    return (
      <button disabled className={`${className} opacity-50 cursor-not-allowed`} {...props}>
        {children}
      </button>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  );
}

export function ProtectedRoute({
  children,
  requiredPermissions = []
}: {
  children: React.ReactNode;
  requiredPermissions?: string[];
}) {
  const { hasAllPermissions, loading } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requiredPermissions.length > 0) {
      if (!hasAllPermissions(requiredPermissions)) {
        router.push('/admin/login'); // Redirect to login or an unauthorized page
      }
    }
  }, [loading, hasAllPermissions, requiredPermissions, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
    return null; // Don't render children if not authorized
  }

  return <>{children}</>;
}
