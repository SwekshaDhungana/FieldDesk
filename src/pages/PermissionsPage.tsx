import { useState, useEffect } from "react";
import { usePermissionStore } from "@/stores/permission-store";
import { ALL_PERMISSIONS, PERMISSION_LABELS, ROLE_LABELS } from "@/types";
import type { Role, Permission } from "@/types";
import { LoadingSpinner } from "@/components/common/Loading";
import { api } from "@/data/api";

const ROLES_TO_SHOW: Role[] = [
  "super_admin",
  "auditor",
  "org_admin",
  "team_lead",
  "agent",
];

export function PermissionsPage() {
  const [loading, setLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const matrix = usePermissionStore((state) => state.matrix);
  const updateRolePermissions = usePermissionStore(
    (state) => state.updateRolePermissions,
  );
  const resetToDefaults = usePermissionStore((state) => state.resetToDefaults);

  useEffect(() => {
    api.getUsers().then(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading permissions..." />;

  function handleToggle(role: Role, permission: Permission) {
    const currentPerms = [...matrix[role]];
    const index = currentPerms.indexOf(permission);

    if (index >= 0) {
      currentPerms.splice(index, 1);
    } else {
      currentPerms.push(permission);
    }

    updateRolePermissions(role, currentPerms);
  }

  function handleReset() {
    resetToDefaults();
    setShowResetConfirm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Permission Management</h1>
          <p className="text-sm text-[#60798D] mt-1">
            Update role access for each permission.
          </p>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-3 py-1.5 border border-[#C4D7E6] rounded bg-[#6699CC] text-sm text-white hover:bg-[#5588BB]"
        >
          Reset to Defaults
        </button>
      </div>

      <div className="bg-white border border-[#D8E6F2] rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#dfecf5]  border-b border-[#F0F6FA]">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-[#496B83] min-w-[180px]">
                Permission
              </th>
              {ROLES_TO_SHOW.map((role) => (
                <th
                  key={role}
                  className="px-4 py-3 font-medium text-[#496B83] text-center min-w-[100px]"
                >
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F6FA]">
            {ALL_PERMISSIONS.map((permission) => (
              <tr key={permission} className="hover:bg-[#F5FAFD]">
                <td className="px-4 py-3 font-medium">
                  {PERMISSION_LABELS[permission]}
                </td>
                {ROLES_TO_SHOW.map((role) => {
                  const hasIt = matrix[role].includes(permission);
                  return (
                    <td
                      key={`${role}-${permission}`}
                      className="px-4 py-3 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={hasIt}
                        onChange={() => handleToggle(role, permission)}
                        className="w-4 h-4 cursor-pointer accent-[#6699CC]"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold mb-2">Reset Permissions?</h3>
            <p className="text-sm text-[#496B83] mb-4">
              This will restore all permissions to their default values.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-[#6699CC] text-white rounded text-sm hover:bg-[#5588BB]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
