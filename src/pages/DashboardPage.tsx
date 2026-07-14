import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useTicketStore } from "@/stores/ticket-store";
import { usePermissions } from "@/hooks/usePermissions";
import type { Organization } from "@/types";
import { ShieldCheck, Building2 } from "lucide-react";
import { api } from "@/data/api";
import {
  ROLE_LABELS,
  PLATFORM_ROLES,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
} from "@/types";
import type { TicketPriority, TicketStatus } from "@/types";

const statusBadgeClasses: Record<TicketStatus, string> = {
  open: "bg-sky-50 text-sky-700 ring-sky-100",
  in_progress: "bg-amber-50 text-amber-700 ring-amber-100",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  closed: "bg-[#E8F0F6] text-[#496B83] ring-[#D8E6F2]",
};

const priorityBadgeClasses: Record<TicketPriority, string> = {
  critical: "bg-red-50 text-red-700 ring-red-100",
  high: "bg-orange-50 text-orange-700 ring-orange-100",
  medium: "bg-yellow-50 text-yellow-800 ring-yellow-100",
  low: "bg-[#E8F0F6] text-[#496B83] ring-[#D8E6F2]",
};

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedOrganizationId = useAuthStore(
    (state) => state.selectedOrganizationId,
  );
  const getTicketsForUser = useTicketStore((state) => state.getTicketsForUser);
  const { can } = usePermissions();

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);

      const organizationsResult = await api.getOrganizations();

      setOrganizations(organizationsResult);
      setLoading(false);
    }

    loadDashboardData();
  }, []);

  if (!currentUser) return null;
  if (loading) return <p className="text-sm text-[#60798D]">Loading...</p>;

  const orgId = PLATFORM_ROLES.includes(currentUser.role)
    ? selectedOrganizationId
    : currentUser.organizationId;
  const tickets = getTicketsForUser(currentUser, orgId);
  const currentOrg = organizations.find((org) => org.id === orgId);
  const isAllOrganizationsView =
    PLATFORM_ROLES.includes(currentUser.role) && !orgId;

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === "in_progress",
  ).length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;
  const criticalTickets = tickets.filter(
    (t) => t.priority === "critical" && t.status !== "closed",
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <h2 className="text-lg font-semibold text-[#1F3446] mb-1">
        {currentUser.name}
      </h2>

      <div className="flex items-center gap-4 text-sm text-[#60798D] mb-6">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-[#6699CC]" />
          <span>{ROLE_LABELS[currentUser.role]}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Building2 size={16} className="text-[#6699CC]" />
          <span>
            {isAllOrganizationsView ? "All Organizations" : currentOrg?.name}
          </span>
        </div>
      </div>

      {can("view_tickets") && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="border-l-4 border-sky-300 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase text-[#60798D]">
                Open Queue
              </p>
              <p className="text-2xl font-semibold text-[#1F3446]">
                {openTickets}
              </p>
              <p className="text-xs text-[#60798D]">waiting for first action</p>
            </div>
            <div className="border-l-4 border-amber-300 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase text-[#60798D]">
                Being Worked
              </p>
              <p className="text-2xl font-semibold text-[#1F3446]">
                {inProgressTickets}
              </p>
              <p className="text-xs text-[#60798D]">owned by the team</p>
            </div>
            <div className="border-l-4 border-emerald-300 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase text-[#60798D]">
                Resolved
              </p>
              <p className="text-2xl font-semibold text-[#1F3446]">
                {resolvedTickets}
              </p>
              <p className="text-xs text-[#60798D]">cleared from queue</p>
            </div>
            <div className="border-l-4 border-red-300 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase text-[#60798D]">
                Critical Watch
              </p>
              <p className="text-2xl font-semibold text-red-600">
                {criticalTickets}
              </p>
              <p className="text-xs text-[#60798D]">needs fast attention</p>
            </div>
          </div>

          {tickets.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
              <div className="bg-white border border-[#D8E6F2] rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#dfecf5] border-b border-[#F0F6FA]">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-[#496B83]">
                        Title
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-[#496B83]">
                        Status
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-[#496B83]">
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F6FA]">
                    {tickets.slice(0, 5).map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="px-4 py-2 font-medium text-[#243B4D]">
                          {ticket.title}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses[ticket.status]}`}
                          >
                            {TICKET_STATUS_LABELS[ticket.status]}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityBadgeClasses[ticket.priority]}`}
                          >
                            {TICKET_PRIORITY_LABELS[ticket.priority]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
