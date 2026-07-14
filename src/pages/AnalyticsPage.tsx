import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useTicketStore } from "@/stores/ticket-store";
import { api } from "@/data/api";
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  PLATFORM_ROLES,
} from "@/types";
import type { TicketStatus, TicketPriority, Organization } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
  Legend,
} from "recharts";
import { LoadingSpinner } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "#3b82f6",
  in_progress: "#f59e0b",
  resolved: "#10b981",
  closed: "#6b7280",
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#6b7280",
};

type PieSliceShapeProps = {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
  color?: string;
  payload?: {
    fill?: string;
    color?: string;
  };
};

function renderPieSlice(props: unknown) {
  const slice = props as PieSliceShapeProps;

  return (
    <Sector
      cx={slice.cx}
      cy={slice.cy}
      innerRadius={slice.innerRadius}
      outerRadius={slice.outerRadius}
      startAngle={slice.startAngle}
      endAngle={slice.endAngle}
      fill={slice.fill ?? slice.payload?.fill ?? slice.color ?? "#6699CC"}
    />
  );
}

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const currentUser = useAuthStore((state) => state.currentUser);
  const selectedOrganizationId = useAuthStore(
    (state) => state.selectedOrganizationId,
  );

  const getTicketsForUser = useTicketStore((state) => state.getTicketsForUser);

  useEffect(() => {
    async function loadAnalyticsData() {
      setLoading(true);

      const organizationsResult = await api.getOrganizations();

      setOrganizations(organizationsResult);
      setLoading(false);
    }

    loadAnalyticsData();
  }, []);

  if (!currentUser) return null;
  if (loading) return <LoadingSpinner message="Loading analytics..." />;

  const orgId = PLATFORM_ROLES.includes(currentUser.role)
    ? selectedOrganizationId
    : currentUser.organizationId;
  const tickets = getTicketsForUser(currentUser, orgId);
  const currentOrg = organizations.find((org) => org.id === orgId);
  const isAllOrganizationsView =
    PLATFORM_ROLES.includes(currentUser.role) && !orgId;

  if (tickets.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <EmptyState title="No data" description="No tickets to analyze." />
      </div>
    );
  }

  const statusData = Object.entries(TICKET_STATUS_LABELS)
    .map(([key, label]) => ({
      name: label,
      value: tickets.filter((t) => t.status === key).length,
      color: STATUS_COLORS[key as TicketStatus],
      fill: STATUS_COLORS[key as TicketStatus],
    }))
    .filter((d) => d.value > 0);

  const priorityData = Object.entries(TICKET_PRIORITY_LABELS)
    .map(([key, label]) => ({
      name: label,
      value: tickets.filter((t) => t.priority === key).length,
      color: PRIORITY_COLORS[key as TicketPriority],
      fill: PRIORITY_COLORS[key as TicketPriority],
    }))
    .filter((d) => d.value > 0);

  const now = new Date();
  const monthlyData = [];
  for (let i = 2; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthStart.toLocaleDateString("en-US", {
      month: "short",
    });

    const created = tickets.filter((t) => {
      const d = new Date(t.createdAt);
      return d >= monthStart && d <= monthEnd;
    });

    monthlyData.push({
      name: monthName,
      created: created.length,
      resolved: created.filter(
        (t) => t.status === "resolved" || t.status === "closed",
      ).length,
    });
  }

  const totalTickets = tickets.length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed",
  ).length;
  const resolutionRate = Math.round((resolvedCount / totalTickets) * 100);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Analytics</h1>
      <p className="text-sm text-[#60798D] mb-6">
        {isAllOrganizationsView ? "All Organizations" : currentOrg?.name}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#D8E6F2] rounded p-4">
          <p className="text-sm text-[#60798D]">Total Tickets</p>
          <p className="text-xl font-bold">{totalTickets}</p>
        </div>
        <div className="bg-white border border-[#D8E6F2] rounded p-4">
          <p className="text-sm text-[#60798D]">Resolution Rate</p>
          <p className="text-xl font-bold">{resolutionRate}%</p>
        </div>
        <div className="bg-white border border-[#D8E6F2] rounded p-4">
          <p className="text-sm text-[#60798D]">Unassigned</p>
          <p className="text-xl font-bold">
            {tickets.filter((t) => !t.assignedTo).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-[#D8E6F2] rounded p-4">
          <h2 className="font-semibold mb-4">By Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                shape={renderPieSlice}
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#D8E6F2] rounded p-4">
          <h2 className="font-semibold mb-4">By Priority</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                shape={renderPieSlice}
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-[#D8E6F2] rounded p-4">
        <h2 className="font-semibold mb-4">Monthly Activity</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="created" fill="#3b82f6" name="Created" />
            <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
