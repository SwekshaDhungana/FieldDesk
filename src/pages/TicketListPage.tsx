import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTicketStore } from "@/stores/ticket-store";
import { usePermissions } from "@/hooks/usePermissions";
import { api } from "@/data/api";
import type { Organization, User } from "@/types";
import { PLATFORM_ROLES, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS } from "@/types";
import type { TicketPriority, TicketStatus } from "@/types";
import { LoadingSpinner } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";

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

export function TicketListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedOrganizationId = useAuthStore(
    (state) => state.selectedOrganizationId,
  );
  const getTicketsForUser = useTicketStore((state) => state.getTicketsForUser);
  const fetchTickets = useTicketStore((state) => state.fetchTickets);
  const loading = useTicketStore((state) => state.loading);
  const { can } = usePermissions();

  useEffect(() => {
    async function loadPageData() {
      try {
        setError(null);

        await fetchTickets();

        const [usersResult, organizationsResult] = await Promise.all([
          api.getUsers(),
          api.getOrganizations(),
        ]);

        setUsers(usersResult);
        setOrganizations(organizationsResult);
      } catch {
        setError("Unable to load tickets. Please try again.");
      }
    }

    loadPageData();
  }, [fetchTickets]);

  if (!currentUser) return null;
  if (loading) return <LoadingSpinner message="Loading tickets..." />;

  if (error) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-semibold">Could not load tickets</h2>
        <p className="text-[#60798D] text-sm mt-1">{error}</p>
      </div>
    );
  }

  const orgId = PLATFORM_ROLES.includes(currentUser.role)
    ? selectedOrganizationId
    : currentUser.organizationId;
  const tickets = getTicketsForUser(currentUser, orgId);
  const currentOrg = organizations.find((org) => org.id === orgId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-sm text-[#60798D]">
            {currentOrg
              ? `${currentOrg.name} support queue`
              : "All organization queues"}
          </p>
        </div>

        {can("create_tickets") && orgId && (
          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6699CC] text-white rounded text-sm hover:bg-[#5588BB]"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        )}
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          title="No tickets"
          description="No tickets in this queue."
        />
      ) : (
        <div className="bg-white border border-[#D8E6F2] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#dfecf5]  border-b border-[#F0F6FA]">
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
                <th className="text-left px-4 py-2 font-medium text-[#496B83]">
                  Assigned To
                </th>
                <th className="text-left px-4 py-2 font-medium text-[#496B83]">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F6FA]">
              {tickets.map((ticket) => {
                const assignee = users.find((u) => u.id === ticket.assignedTo);
                return (
                  <tr key={ticket.id} className="hover:bg-[#F5FAFD]">
                    <td className="px-4 py-3">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-[#6699CC] hover:underline"
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses[ticket.status]}`}
                      >
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityBadgeClasses[ticket.priority]}`}
                      >
                        {TICKET_PRIORITY_LABELS[ticket.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#496B83]">
                      {assignee ? assignee.name : "-"}
                    </td>
                    <td className="px-4 py-3 text-[#60798D]">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
