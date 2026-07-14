import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { ROLE_LABELS, PLATFORM_ROLES } from "@/types";
import type { Role, User, UserFormData } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { useUserStore } from "@/stores/user-store";
import { useOrganizationStore } from "@/stores/organization-store";
import { usePermissions } from "@/hooks/usePermissions";

const STAFF_ROLES: Role[] = ["org_admin", "team_lead", "agent"];

export function StaffPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "agent",
    organizationId: null,
    isActive: true,
  });
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedOrganizationId = useAuthStore(
    (state) => state.selectedOrganizationId,
  );
  const organizations = useOrganizationStore((state) => state.organizations);
  const users = useUserStore((state) => state.users);
  const createUser = useUserStore((state) => state.createUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const toggleUserStatus = useUserStore((state) => state.toggleUserStatus);
  const { can } = usePermissions();

  if (!currentUser) return null;

  const orgId = PLATFORM_ROLES.includes(currentUser.role)
    ? selectedOrganizationId
    : currentUser.organizationId;

  const staffList = users.filter((staffUser) => {
    if (!staffUser.organizationId) {
      return false;
    }

    if (PLATFORM_ROLES.includes(currentUser.role)) {
      return orgId ? staffUser.organizationId === orgId : true;
    }

    return staffUser.organizationId === currentUser.organizationId;
  });
  const canManageStaff = can("manage_staff");
  const currentOrg = organizations.find((org) => org.id === orgId);
  const availableOrganizations = PLATFORM_ROLES.includes(currentUser.role)
    ? organizations
    : organizations.filter((org) => org.id === currentUser.organizationId);

  const defaultOrganizationId =
    orgId || availableOrganizations[0]?.id || currentUser.organizationId;

  function openCreateForm() {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "agent",
      organizationId: defaultOrganizationId,
      isActive: true,
    });
    setFormOpen(true);
  }

  function openEditForm(user: User) {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      isActive: user.isActive,
    });
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!currentUser) {
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, formData, currentUser);
    } else {
      createUser(formData, currentUser);
    }

    setFormOpen(false);
    setEditingUser(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Staff</h1>
          <p className="text-sm text-[#60798D]">
            {currentOrg ? currentOrg.name : "All organizations"}
          </p>
        </div>

        {canManageStaff && (
          <button
            type="button"
            onClick={openCreateForm}
            className="px-3 py-1.5 bg-[#6699CC] text-white rounded text-sm hover:bg-[#5588BB]"
          >
            Add Staff
          </button>
        )}
      </div>

      {formOpen && canManageStaff && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#D8E6F2] rounded p-4 mb-6 space-y-3"
        >
          <h2 className="font-semibold">
            {editingUser ? "Edit Staff Member" : "New Staff Member"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full border border-[#C4D7E6] rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as Role })
                }
                className="w-full border border-[#C4D7E6] rounded px-3 py-2 text-sm"
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Organization
              </label>
              <select
                value={formData.organizationId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    organizationId: e.target.value || null,
                  })
                }
                disabled={!PLATFORM_ROLES.includes(currentUser.role)}
                className="w-full border border-[#C4D7E6] rounded px-3 py-2 text-sm disabled:bg-[#F0F6FA]"
              >
                {availableOrganizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#496B83]">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 accent-[#6699CC]"
            />
            Active account
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#6699CC] text-white rounded text-sm hover:bg-[#5588BB]"
            >
              {editingUser ? "Save Changes" : "Create Staff"}
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

      {staffList.length === 0 ? (
        <EmptyState
          title="No staff found"
          description="No staff members in this organization."
        />
      ) : (
        <div className="bg-white border border-[#D8E6F2] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#dfecf5]  border-b border-[#F0F6FA]">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-[#496B83]">
                  Name
                </th>
                <th className="text-left px-4 py-2 font-medium text-[#496B83]">
                  Email
                </th>
                <th className="text-left px-4 py-2 font-medium text-[#496B83]">
                  Role
                </th>
                <th className="text-left px-4 py-2 font-medium text-[#496B83]">
                  Status
                </th>
                <th className="text-left px-4 py-2 font-medium text-[#496B83]">
                  Joined
                </th>
                {canManageStaff && (
                  <th className="text-left px-4 py-2 font-medium text-[#496B83]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F6FA]">
              {staffList.map((user) => (
                <tr key={user.id} className="hover:bg-[#F5FAFD]">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-[#496B83]">{user.email}</td>
                  <td className="px-4 py-3">{ROLE_LABELS[user.role]}</td>
                  <td className="px-4 py-3">
                    {user.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3 text-[#60798D]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  {canManageStaff && (
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => openEditForm(user)}
                          className="text-[#6699CC] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(user.id, currentUser)}
                          className="text-[#496B83] hover:underline"
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
