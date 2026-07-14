import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
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

export function TicketCreatePage() {
  const navigate = useNavigate();
  const createTicket = useTicketStore((state) => state.createTicket);
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedOrganizationId = useAuthStore(
    (state) => state.selectedOrganizationId,
  );
  const { can } = usePermissions();

  const orgId = currentUser && PLATFORM_ROLES.includes(currentUser.role)
    ? selectedOrganizationId
    : currentUser?.organizationId ?? null;
  const [users, setUsers] = useState<User[]>([]);
  const usersInThisOrg = users.filter((user) => user.organizationId === orgId);

  useEffect(() => {
    api.getUsers().then(setUsers);
  }, []);
  const [formData, setFormData] = useState<TicketFormData>({
    title: "",
    description: "",
    status: "open",
    priority: "medium",
    assignedTo: null,
  });

  if (!currentUser || !orgId) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;
    const createdTicket = createTicket(
      formData,
      orgId!,
      currentUser!.id,
      currentUser!,
    );

    if (!createdTicket) return;

    navigate("/tickets");
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

      <h1 className="text-2xl font-bold mt-4 mb-6">Create New Ticket</h1>

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
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6699CC] text-white rounded text-sm hover:bg-[#5588BB]"
          >
            <Plus className="h-4 w-4" />
            Create Ticket
          </button>
          <Link
            to="/tickets"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#C4D7E6] rounded text-sm hover:bg-[#F5FAFD]"
          >
            <X className="h-4 w-4" />
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
