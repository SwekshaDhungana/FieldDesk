import { create } from "zustand";
import type { User } from "@/types";
import { PLATFORM_ROLES } from "@/types";
import { USERS } from "@/data/mock-data";

interface AuthStore {
  currentUser: User | null;
  selectedOrganizationId: string | null;
  setCurrentUser: (user: User) => void;
  setSelectedOrganization: (orgId: string | null) => void;
  isPlatformUser: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: USERS[0],
  selectedOrganizationId: null,

  setCurrentUser: (user: User) => {
    const isUserPlatformLevel = PLATFORM_ROLES.includes(user.role);

    if (isUserPlatformLevel) {
      set({
        currentUser: user,
        selectedOrganizationId: null,
      });
    } else {
      set({
        currentUser: user,
        selectedOrganizationId: user.organizationId,
      });
    }
  },

  setSelectedOrganization: (orgId: string | null) => {
    set({ selectedOrganizationId: orgId });
  },

  isPlatformUser: () => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      return false;
    }
    return PLATFORM_ROLES.includes(currentUser.role);
  },

}));
