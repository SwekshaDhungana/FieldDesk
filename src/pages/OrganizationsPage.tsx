import { useState } from "react";
import type { SyntheticEvent } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useTicketStore } from "@/stores/ticket-store";
import { useOrganizationStore } from "@/stores/organization-store";
import { useUserStore } from "@/stores/user-store";
import { usePermissions } from "@/hooks/usePermissions";
import type { Organization, OrganizationFormData } from "@/types";

const EMPTY_ORGANIZATION_FORM: OrganizationFormData = {
  name: "",
  description: "",
};

export function OrganizationsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] =
    useState<Organization | null>(null);
  const [formData, setFormData] = useState<OrganizationFormData>(
    EMPTY_ORGANIZATION_FORM,
  );
  const currentUser = useAuthStore((state) => state.currentUser);
  const allTickets = useTicketStore((state) => state.tickets);
  const users = useUserStore((state) => state.users);
  const createOrganization = useOrganizationStore(
    (state) => state.createOrganization,
  );
  const updateOrganization = useOrganizationStore(
    (state) => state.updateOrganization,
  );
  const getOrganizationsForUser = useOrganizationStore(
    (state) => state.getOrganizationsForUser,
  );
  const { can } = usePermissions();

  if (!currentUser) return null;

  const visibleOrgs = getOrganizationsForUser(currentUser);
  const canManageOrganizations = can("manage_organizations");

  function openCreateForm() {
    setEditingOrganization(null);
    setFormData(EMPTY_ORGANIZATION_FORM);
    setFormOpen(true);
  }

  function openEditForm(organization: Organization) {
    setEditingOrganization(organization);
    setFormData({
      name: organization.name,
      description: organization.description,
    });
    setFormOpen(true);
  }

  function handleSubmit(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e.preventDefault();

    if (!currentUser) {
      return;
    }

    if (editingOrganization) {
      updateOrganization(editingOrganization.id, formData, currentUser);
    } else {
      createOrganization(formData, currentUser);
    }

    setFormOpen(false);
    setEditingOrganization(null);
    setFormData(EMPTY_ORGANIZATION_FORM);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
        </div>

        {canManageOrganizations && (
          <button
            type="button"
            onClick={openCreateForm}
            className="px-3 py-1.5 bg-[#6699CC] text-white rounded text-sm hover:bg-[#5588BB]"
          >
            Add Organization
          </button>
        )}
      </div>

      {formOpen && canManageOrganizations && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#D8E6F2] rounded p-4 mb-6 space-y-3"
        >
          <h2 className="font-semibold">
            {editingOrganization ? "Edit Organization" : "New Organization"}
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full border border-[#C4D7E6] rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={3}
              className="w-full border border-[#C4D7E6] rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#6699CC] text-white rounded text-sm hover:bg-[#5588BB]"
            >
              {editingOrganization ? "Save Changes" : "Create Organization"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-3 py-1.5 border border-[#C4D7E6] rounded text-sm text-[#496B83]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleOrgs.map((org) => {
          const memberCount = users.filter(
            (u) => u.organizationId === org.id,
          ).length;
          const ticketCount = allTickets.filter(
            (t) => t.organizationId === org.id,
          ).length;

          return (
            <div
              key={org.id}
              className="bg-white border border-[#D8E6F2] rounded p-5"
            >
              <h3 className="font-semibold">{org.name}</h3>
              <p className="text-sm text-[#60798D] mt-1">{org.description}</p>
              <div className="mt-3 text-sm text-[#496B83] space-y-1">
                <p>{memberCount} members</p>
                <p>{ticketCount} tickets</p>
              </div>
              {canManageOrganizations && (
                <button
                  type="button"
                  onClick={() => openEditForm(org)}
                  className="mt-4 text-sm text-[#6699CC] hover:underline"
                >
                  Edit details
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
