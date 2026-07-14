import { useAuthStore } from "@/stores/auth-store";
import { usePermissionStore } from "@/stores/permission-store";
import type { Permission } from "@/types";

export function usePermissions() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const hasPermission = usePermissionStore((state) => state.hasPermission);

  function can(permission: Permission): boolean {
    if (!currentUser) return false;
    return hasPermission(currentUser.role, permission);
  }

  function canAny(permissions: Permission[]): boolean {
    return permissions.some((p) => can(p));
  }

  function canAll(permissions: Permission[]): boolean {
    return permissions.every((p) => can(p));
  }

  return { can, canAny, canAll };
}
