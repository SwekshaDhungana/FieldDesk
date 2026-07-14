import { create } from "zustand";
import type { Ticket, TicketFormData, User } from "@/types";
import { PLATFORM_ROLES } from "@/types";
import { TICKETS } from "@/data/mock-data";
import { usePermissionStore } from "@/stores/permission-store";

interface TicketStore {
  tickets: Ticket[];
  loading: boolean;
  fetchTickets: () => Promise<void>;
  createTicket: (
    data: TicketFormData,
    organizationId: string,
    createdBy: string,
    user: User,
  ) => Ticket | null;
  updateTicket: (
    id: string,
    data: Partial<TicketFormData>,
    user: User,
  ) => Ticket | null;
  deleteTicket: (id: string, user: User) => boolean;
  getTicketById: (id: string) => Ticket | undefined;
  getTicketsForUser: (user: User, orgId: string | null) => Ticket[];
}

let nextTicketNumber = 100;

function canAccessTicket(user: User, ticket: Ticket): boolean {
  // Platform users are handled here so pages do not need to repeat this check.
  if (PLATFORM_ROLES.includes(user.role)) {
    return true;
  }

  const { hasPermission } = usePermissionStore.getState();

  const isSameOrganization = ticket.organizationId === user.organizationId;
  const isAssignedToMe = ticket.assignedTo === user.id;
  const isCreatedByMe = ticket.createdBy === user.id;
  const canManageTickets = hasPermission(user.role, "assign_tickets");

  if (!isSameOrganization) {
    return false;
  }

  if (canManageTickets) {
    return true;
  }

  // Agents and similarly limited users only get tickets they own or are assigned.
  return isAssignedToMe || isCreatedByMe;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [...TICKETS],
  loading: false,

  fetchTickets: async () => {
    set({ loading: false });
  },

  createTicket: (
    data: TicketFormData,
    organizationId: string,
    createdBy: string,
    user: User,
  ) => {
    const { hasPermission } = usePermissionStore.getState();

    if (!hasPermission(user.role, "create_tickets")) {
      return null;
    }

    if (
      !PLATFORM_ROLES.includes(user.role) &&
      user.organizationId !== organizationId
    ) {
      return null;
    }

    if (data.assignedTo && !hasPermission(user.role, "assign_tickets")) {
      return null;
    }

    const newTicket: Ticket = {
      id: `ticket-new-${nextTicketNumber}`,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      organizationId,
      createdBy,
      assignedTo: data.assignedTo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    nextTicketNumber += 1;
    set({ tickets: [newTicket, ...get().tickets] });
    return newTicket;
  },

  updateTicket: (id: string, data: Partial<TicketFormData>, user: User) => {
    const { hasPermission } = usePermissionStore.getState();
    const existingTicket = get().tickets.find((ticket) => ticket.id === id);

    if (!existingTicket) {
      return null;
    }

    if (!hasPermission(user.role, "edit_tickets")) {
      return null;
    }

    if (!canAccessTicket(user, existingTicket)) {
      return null;
    }

    const assignmentChanged =
      data.assignedTo !== undefined &&
      data.assignedTo !== existingTicket.assignedTo;

    if (assignmentChanged && !hasPermission(user.role, "assign_tickets")) {
      return null;
    }

    let updatedTicket: Ticket | null = null;

    const newTicketsList = get().tickets.map((ticket) => {
      if (ticket.id === id) {
        updatedTicket = {
          ...ticket,
          ...data,
          updatedAt: new Date().toISOString(),
        };
        return updatedTicket;
      }
      return ticket;
    });

    set({ tickets: newTicketsList });
    return updatedTicket;
  },
  deleteTicket: (id: string, user: User) => {
    const { hasPermission } = usePermissionStore.getState();
    const existingTicket = get().tickets.find((ticket) => ticket.id === id);

    if (!existingTicket) {
      return false;
    }

    if (!hasPermission(user.role, "delete_tickets")) {
      return false;
    }

    if (!canAccessTicket(user, existingTicket)) {
      return false;
    }

    set({ tickets: get().tickets.filter((ticket) => ticket.id !== id) });
    return true;
  },
  getTicketById: (id: string) => {
    return get().tickets.find((ticket) => ticket.id === id);
  },

  getTicketsForUser: (user: User, orgId: string | null) => {
    const allTickets = get().tickets;

    if (PLATFORM_ROLES.includes(user.role)) {
      if (!orgId) return allTickets;
      return allTickets.filter((ticket) => ticket.organizationId === orgId);
    }

    return allTickets.filter((ticket) => canAccessTicket(user, ticket));
  },
}));
