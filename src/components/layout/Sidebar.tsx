import { NavLink } from "react-router-dom";
import type { Permission } from "@/types";
import { usePermissions } from "@/hooks/usePermissions";
import { UserSwitcher } from "./UserSwitcher";
import {
  LayoutDashboard,
  Ticket,
  Building2,
  Users,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  permission?: Permission;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  {
    label: "Tickets",
    path: "/tickets",
    permission: "view_tickets",
    icon: Ticket,
  },
  {
    label: "Organizations",
    path: "/organizations",
    permission: "view_organizations",
    icon: Building2,
  },
  { label: "Staff", path: "/staff", permission: "view_staff", icon: Users },
  {
    label: "Analytics",
    path: "/analytics",
    permission: "view_analytics",
    icon: BarChart3,
  },
  {
    label: "Permissions",
    path: "/permissions",
    permission: "manage_permissions",
    icon: ShieldCheck,
  },
];

export function Sidebar() {
  const { can } = usePermissions();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return can(item.permission);
  });

  return (
    <aside className="w-56 bg-[#243B4D] border-r border-[#1C3040] flex flex-col h-screen fixed left-0 top-0">
      <div className="px-5 py-5 border-b border-[#324D61]">
        <h1 className="text-lg font-bold tracking-tight text-[#F5FAFD]">
          FieldDesk
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-[#6699CC] text-white shadow-sm"
                  : "flex items-center gap-2 px-3 py-2 rounded text-sm text-[#D8E6F2] hover:bg-[#324D61] hover:text-white"
              }
            >
              <Icon className="h-4 w-4 text-current" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#324D61]">
        <UserSwitcher />
      </div>
    </aside>
  );
}
