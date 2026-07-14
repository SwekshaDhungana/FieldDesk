export type Role =
  | "super_admin"
  | "auditor"
  | "org_admin"
  | "team_lead"
  | "agent";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  auditor: "Auditor",
  org_admin: "Organization Admin",
  team_lead: "Team Lead",
  agent: "Agent",
};

export const PLATFORM_ROLES: Role[] = ["super_admin", "auditor"];

export type Permission =
  | "view_tickets"
  | "create_tickets"
  | "edit_tickets"
  | "assign_tickets"
  | "delete_tickets"
  | "view_staff"
  | "manage_staff"
  | "view_organizations"
  | "manage_organizations"
  | "view_analytics"
  | "manage_permissions";

export const ALL_PERMISSIONS: Permission[] = [
  "view_tickets",
  "create_tickets",
  "edit_tickets",
  "assign_tickets",
  "delete_tickets",
  "view_staff",
  "manage_staff",
  "view_organizations",
  "manage_organizations",
  "view_analytics",
  "manage_permissions",
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_tickets: "View Tickets",
  create_tickets: "Create Tickets",
  edit_tickets: "Edit Tickets",
  assign_tickets: "Assign Tickets",
  delete_tickets: "Delete Tickets",
  view_staff: "View Staff",
  manage_staff: "Manage Staff",
  view_organizations: "View Organizations",
  manage_organizations: "Manage Organizations",
  view_analytics: "View Analytics",
  manage_permissions: "Manage Permissions",
};

export type PermissionMatrix = Record<Role, Permission[]>;

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  memberCount: number;
  ticketCount: number;
}

export interface OrganizationFormData {
  name: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  organizationId: string | null;
  createdAt: string;
  isActive: boolean;
}

export interface UserFormData {
  name: string;
  email: string;
  role: Role;
  organizationId: string | null;
  isActive: boolean;
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  organizationId: string;
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketFormData {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
}
