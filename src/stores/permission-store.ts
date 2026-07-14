import { create } from 'zustand';
import type { Permission, PermissionMatrix, Role } from '@/types';
import { DEFAULT_PERMISSIONS } from '@/data/mock-data';

interface PermissionStore {
  matrix: PermissionMatrix;
  updateRolePermissions: (role: Role, permissions: Permission[]) => void;
  hasPermission: (role: Role, permission: Permission) => boolean;
  getRolePermissions: (role: Role) => Permission[];
  resetToDefaults: () => void;
}

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  matrix: structuredClone(DEFAULT_PERMISSIONS),

  updateRolePermissions: (role: Role, permissions: Permission[]) => {
    const newMatrix = {
      ...get().matrix,
      [role]: [...permissions],
    };
    set({ matrix: newMatrix });
  },

  hasPermission: (role: Role, permission: Permission) => {
    return get().matrix[role].includes(permission);
  },

  getRolePermissions: (role: Role) => {
    return get().matrix[role];
  },

  resetToDefaults: () => {
    set({ matrix: structuredClone(DEFAULT_PERMISSIONS) });
  },
}));
