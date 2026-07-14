import { create } from "zustand";
import { ORGANIZATIONS } from "@/data/mock-data";
import { PLATFORM_ROLES } from "@/types";
import type { Organization, OrganizationFormData, User } from "@/types";
import { usePermissionStore } from "@/stores/permission-store";

interface OrganizationStore {
  organizations: Organization[];
  createOrganization: (
    data: OrganizationFormData,
    user: User,
  ) => Organization | null;
  updateOrganization: (
    id: string,
    data: OrganizationFormData,
    user: User,
  ) => Organization | null;
  getOrganizationsForUser: (user: User) => Organization[];
}

let nextOrganizationNumber = 100;

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function canManageOrganization(user: User, organizationId?: string): boolean {
  const { hasPermission } = usePermissionStore.getState();

  if (!hasPermission(user.role, "manage_organizations")) {
    return false;
  }

  if (PLATFORM_ROLES.includes(user.role)) {
    return true;
  }

  return Boolean(organizationId && user.organizationId === organizationId);
}

export const useOrganizationStore = create<OrganizationStore>((set, get) => ({
  organizations: [...ORGANIZATIONS],

  createOrganization: (data, user) => {
    if (!canManageOrganization(user)) {
      return null;
    }

    const organization: Organization = {
      id: `org-new-${nextOrganizationNumber}`,
      name: data.name,
      slug: slugify(data.name) || `organization-${nextOrganizationNumber}`,
      description: data.description,
      createdAt: new Date().toISOString(),
      memberCount: 0,
      ticketCount: 0,
    };

    nextOrganizationNumber += 1;
    set({ organizations: [organization, ...get().organizations] });
    return organization;
  },

  updateOrganization: (id, data, user) => {
    if (!canManageOrganization(user, id)) {
      return null;
    }

    let updatedOrganization: Organization | null = null;

    const organizations = get().organizations.map((organization) => {
      if (organization.id !== id) {
        return organization;
      }

      updatedOrganization = {
        ...organization,
        name: data.name,
        slug: slugify(data.name) || organization.slug,
        description: data.description,
      };
      return updatedOrganization;
    });

    set({ organizations });
    return updatedOrganization;
  },

  getOrganizationsForUser: (user) => {
    const organizations = get().organizations;

    if (PLATFORM_ROLES.includes(user.role)) {
      return organizations;
    }

    return organizations.filter((org) => org.id === user.organizationId);
  },
}));
