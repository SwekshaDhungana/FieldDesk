import type { ReactNode } from "react";
import type { Permission } from "@/types";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGateProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAny, canAll } = usePermissions();

  if (permission) {
    return can(permission) ? <>{children}</> : <>{fallback}</>;
  }

  if (permissions) {
    const hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  return <>{children}</>;
}
