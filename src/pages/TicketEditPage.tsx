import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTicketStore } from "@/stores/ticket-store";
import { useAuthStore } from "@/stores/auth-store";
import { usePermissions } from "@/hooks/usePermissions";
import { api } from "@/data/api";
import { PLATFORM_ROLES, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS } from "@/types";
import type {
  TicketStatus,
  TicketPriority,
  TicketFormData,
  User,
} from "@/types";
import { LoadingSpinner } from "@/components/common/Loading";

export function TicketEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  const getTicketById = useTicketStore((state) => state.getTicketById);
  const updateTicket = useTicketStore((state) => state.updateTicket);
  const selectedOrganizationId = useAuthStore(
    (state) => state.selectedOrganizationId,
  );
  const currentUser = useAuthStore((state) => state.currentUser);
  const { can } = usePermissions();

  const ticket = getTicketById(id!);
  const orgId = currentUser && PLATFORM_ROLES.includes(currentUser.role)
    ? selectedOrganizationId
    : currentUser?.organizationId ?? null;
  const usersInThisOrg = users.filter(
    (user) => user.organizationId === (ticket?.organizationId || orgId),
  );

  const [formData, setFormData] = useState<TicketFormData>({
    title: "",
    description: "",
    status: "open",
    priority: "medium",
    assignedTo: null,
  });

  useEffect(() => {
    async function loadTicketEditData() {
      setLoading(true);

      const [, usersResult] = await Promise.all([
        api.getTicketById(id!),
        api.getUsers(),
      ]);

      setUsers(usersResult);
      setLoading(false);
    }

    loadTicketEditData();
  }, [id]);

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo,
      });
    }
  }, [ticket]);

  if (loading) return <LoadingSpinner message="Loading..." />;

  if (!ticket) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-semibold">Ticket Not Found</h2>
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1 text-[#6699CC] hover:underline text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Link>
      </div>
    );
  }

  const canAccessTicket = currentUser
    ? useTicketStore
        .getState()
        .getTicketsForUser(currentUser, null)
        .some((visibleTicket) => visibleTicket.id === ticket.id)
    : false;

  if (!canAccessTicket) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-semibold">Access Restricted</h2>
        <p className="text-[#60798D] text-sm mt-1">
          You don't have permission to edit this ticket.
        </p>
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1 text-[#6699CC] hover:underline text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (!canAccessTicket) return;

    const updatedTicket = updateTicket(ticket!.id, formData, currentUser!);

    if (!updatedTicket) return;

    navigate(`/tickets/${ticket!.id}`);
  }
  return (
    <div className="max-w-xl">
      <Link
        to="/tickets"
        className="inline-flex items-center gap-1 text-[#6699CC] hover:underline text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">Edit Ticket</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#D8E6F2] rounded p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-[#C4D7E6] rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-[#C4D7E6] rounded text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as TicketStatus,
                })
              }
              className="w-full px-3 py-2 border border-[#C4D7E6] rounded text-sm"
            >
              {Object.entries(TICKET_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as TicketPriority,
                })
              }
              className="w-full px-3 py-2 border border-[#C4D7E6] rounded text-sm"
            >
              {Object.entries(TICKET_PRIORITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {can("assign_tickets") && (
          <div>
            <label className="block text-sm font-medium mb-1">Assign To</label>
            <select
              value={formData.assignedTo || ""}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value || null })
              }
              className="w-full px-3 py-2 border border-[#C4D7E6] rounded text-sm"
            >
              <option value="">Unassigned</option>
              {usersInThisOrg.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <button
            type="submit"
            className="px-4 py-2 bg-[#6699CC] text-white rounded text-sm hover:bg-[#5588BB]"
          >
            Save Changes
          </button>
          <Link
            to={`/tickets/${ticket.id}`}
            className="px-4 py-2 border border-[#C4D7E6] rounded text-sm hover:bg-[#F5FAFD]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
