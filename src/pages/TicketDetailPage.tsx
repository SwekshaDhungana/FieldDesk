import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useTicketStore } from "@/stores/ticket-store";
import { useAuthStore } from "@/stores/auth-store";
import type { User, Organization } from "@/types";
import { api } from "@/data/api";
import { TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS } from "@/types";
import { PermissionGate } from "@/components/common/PermissionGate";
import { LoadingSpinner } from "@/components/common/Loading";

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const getTicketById = useTicketStore((state) => state.getTicketById);
  const deleteTicket = useTicketStore((state) => state.deleteTicket);
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    async function loadTicketDetails() {
      setLoading(true);

      const [, usersResult, organizationsResult] = await Promise.all([
        api.getTicketById(id!),
        api.getUsers(),
        api.getOrganizations(),
      ]);

      setUsers(usersResult);
      setOrganizations(organizationsResult);
      setLoading(false);
    }

    loadTicketDetails();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading ticket..." />;

  const ticket = getTicketById(id!);

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

  if (!currentUser) return null;

  const visibleTickets = useTicketStore
    .getState()
    .getTicketsForUser(currentUser, null);

  const canAccessTicket = visibleTickets.some(
    (visibleTicket) => visibleTicket.id === ticket.id,
  );

  if (!canAccessTicket) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-semibold">Access Restricted</h2>
        <p className="text-[#60798D] text-sm mt-1">
          You don't have permission to view this ticket.
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

  const creator = users.find((u) => u.id === ticket.createdBy);
  const assignee = users.find((u) => u.id === ticket.assignedTo);
  const organization = organizations.find(
    (o) => o.id === ticket.organizationId,
  );

  function handleDelete() {
    if (!canAccessTicket) return;

    const deleted = deleteTicket(ticket!.id, currentUser!);

    if (!deleted) return;

    navigate("/tickets");
  }

  return (
    <div>
      <Link
        to="/tickets"
        className="inline-flex items-center gap-1 text-[#6699CC] hover:underline text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </Link>

      <div className="mt-4 mb-6 flex items-start justify-between">
        <h1 className="text-2xl font-bold">{ticket.title}</h1>
        <div className="flex gap-2">
          <PermissionGate permission="edit_tickets">
            <Link
              to={`/tickets/${ticket.id}/edit`}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#C4D7E6] rounded text-sm hover:bg-[#F5FAFD]"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </PermissionGate>
          <PermissionGate permission="delete_tickets">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </PermissionGate>
        </div>
      </div>

      <div className="bg-white border border-[#D8E6F2] rounded p-6 mb-6">
        <h2 className="font-semibold mb-2">Description</h2>
        <p className="text-sm text-[#334E63] whitespace-pre-wrap">
          {ticket.description}
        </p>
      </div>

      <div className="bg-white border border-[#D8E6F2] rounded p-6 mb-6">
        <h2 className="font-semibold mb-3">Details</h2>
        <table className="text-sm">
          <tbody>
            <tr>
              <td className="pr-8 py-1 text-[#60798D]">Status</td>
              <td className="py-1">{TICKET_STATUS_LABELS[ticket.status]}</td>
            </tr>
            <tr>
              <td className="pr-8 py-1 text-[#60798D]">Priority</td>
              <td className="py-1">
                {TICKET_PRIORITY_LABELS[ticket.priority]}
              </td>
            </tr>
            <tr>
              <td className="pr-8 py-1 text-[#60798D]">Assigned To</td>
              <td className="py-1">
                {assignee ? assignee.name : "Unassigned"}
              </td>
            </tr>
            <tr>
              <td className="pr-8 py-1 text-[#60798D]">Created By</td>
              <td className="py-1">{creator ? creator.name : "Unknown"}</td>
            </tr>
            <tr>
              <td className="pr-8 py-1 text-[#60798D]">Organization</td>
              <td className="py-1">
                {organization ? organization.name : "Unknown"}
              </td>
            </tr>
            <tr>
              <td className="pr-8 py-1 text-[#60798D]">Created</td>
              <td className="py-1">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </td>
            </tr>
            <tr>
              <td className="pr-8 py-1 text-[#60798D]">Last Updated</td>
              <td className="py-1">
                {new Date(ticket.updatedAt).toLocaleDateString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold mb-2">Delete Ticket?</h3>
            <p className="text-sm text-[#496B83] mb-4">
              Are you sure you want to delete "{ticket.title}"? This cannot be
              undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
