import { create } from "zustand";
import { USERS } from "@/data/mock-data";
import { PLATFORM_ROLES } from "@/types";
import type { User, UserFormData } from "@/types";
import { usePermissionStore } from "@/stores/permission-store";

interface UserStore {
  users: User[];
  createUser: (data: UserFormData, manager: User) => User | null;
  updateUser: (
    id: string,
    data: UserFormData,
    manager: User,
  ) => User | null;
  toggleUserStatus: (id: string, manager: User) => User | null;
  getStaffForUser: (user: User, orgId: string | null) => User[];
}

let nextUserNumber = 100;

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function canManageStaff(manager: User, targetOrganizationId: string | null) {
  const { hasPermission } = usePermissionStore.getState();

  if (!hasPermission(manager.role, "manage_staff")) {
    return false;
  }

  if (PLATFORM_ROLES.includes(manager.role)) {
    return true;
  }

  return Boolean(
    targetOrganizationId && targetOrganizationId === manager.organizationId,
  );
}

function isVisibleStaffMember(user: User): boolean {
  return Boolean(user.organizationId);
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [...USERS],

  createUser: (data, manager) => {
    if (!canManageStaff(manager, data.organizationId)) {
      return null;
    }

    if (
      !PLATFORM_ROLES.includes(manager.role) &&
      PLATFORM_ROLES.includes(data.role)
    ) {
      return null;
    }

    const user: User = {
      id: `user-new-${nextUserNumber}`,
      name: data.name,
      email: data.email,
      avatar: getInitials(data.name),
      role: data.role,
      organizationId: data.organizationId,
      createdAt: new Date().toISOString(),
      isActive: data.isActive,
    };

    nextUserNumber += 1;
    set({ users: [user, ...get().users] });
    return user;
  },

  updateUser: (id, data, manager) => {
    const existingUser = get().users.find((user) => user.id === id);

    if (
      !existingUser ||
      !canManageStaff(manager, existingUser.organizationId)
    ) {
      return null;
    }

    if (!canManageStaff(manager, data.organizationId)) {
      return null;
    }

    if (
      !PLATFORM_ROLES.includes(manager.role) &&
      PLATFORM_ROLES.includes(data.role)
    ) {
      return null;
    }

    let updatedUser: User | null = null;

    const users = get().users.map((user) => {
      if (user.id !== id) {
        return user;
      }

      updatedUser = {
        ...user,
        name: data.name,
        email: data.email,
        avatar: getInitials(data.name),
        role: data.role,
        organizationId: data.organizationId,
        isActive: data.isActive,
      };
      return updatedUser;
    });

    set({ users });
    return updatedUser;
  },

  toggleUserStatus: (id, manager) => {
    const existingUser = get().users.find((user) => user.id === id);

    if (
      !existingUser ||
      !canManageStaff(manager, existingUser.organizationId)
    ) {
      return null;
    }

    let updatedUser: User | null = null;

    const users = get().users.map((user) => {
      if (user.id !== id) {
        return user;
      }

      updatedUser = {
        ...user,
        isActive: !user.isActive,
      };
      return updatedUser;
    });

    set({ users });
    return updatedUser;
  },

  getStaffForUser: (user, orgId) => {
    const staff = get().users.filter(isVisibleStaffMember);

    if (PLATFORM_ROLES.includes(user.role)) {
      if (!orgId) return staff;
      return staff.filter((staffUser) => staffUser.organizationId === orgId);
    }

    return staff.filter(
      (staffUser) => staffUser.organizationId === user.organizationId,
    );
  },
}));
