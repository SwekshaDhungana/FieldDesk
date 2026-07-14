import { useAuthStore } from "@/stores/auth-store";
import { ROLE_LABELS } from "@/types";
import { useUserStore } from "@/stores/user-store";
import { useOrganizationStore } from "@/stores/organization-store";

export function UserSwitcher() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedOrganizationId = useAuthStore(
    (state) => state.selectedOrganizationId,
  );
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const setSelectedOrganization = useAuthStore(
    (state) => state.setSelectedOrganization,
  );
  const isPlatformUser = useAuthStore((state) => state.isPlatformUser);
  const allUsers = useUserStore((state) => state.users);
  const organizations = useOrganizationStore((state) => state.organizations);

  if (!currentUser) return null;

  function handleUserChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const user = allUsers.find((u) => u.id === e.target.value);
    if (user) setCurrentUser(user);
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs text-[#AFC7D9] mb-1">
          Current User
        </label>
        <select
          value={currentUser.id}
          onChange={handleUserChange}
          className="w-full text-sm border border-[#496B83] bg-[#1F3446] text-[#F5FAFD] rounded px-2 py-1.5 focus:border-[#6699CC] focus:outline-none"
        >
          {allUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({ROLE_LABELS[user.role]})
            </option>
          ))}
        </select>
      </div>

      {isPlatformUser() && (
        <div>
          <label className="block text-xs text-[#AFC7D9] mb-1">
            Organization
          </label>
          <select
            value={selectedOrganizationId || ""}
            onChange={(e) => setSelectedOrganization(e.target.value || null)}
            className="w-full text-sm border border-[#496B83] bg-[#1F3446] text-[#F5FAFD] rounded px-2 py-1.5 focus:border-[#6699CC] focus:outline-none"
          >
            <option value="">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
