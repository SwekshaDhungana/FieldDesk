import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Permission } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/stores/auth-store';

interface ProtectedRouteProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  children: ReactNode;
}

export function ProtectedRoute({ permission, permissions, requireAll = false, children }: ProtectedRouteProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { can, canAny, canAll } = usePermissions();

  if (!currentUser) return <Navigate to="/" replace />;

  let hasAccess = true;

  if (permission) {
    hasAccess = can(permission);
  } else if (permissions) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  }

  if (!hasAccess) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-semibold">Access Restricted</h2>
        <p className="text-[#60798D] text-sm mt-1">You don't have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
