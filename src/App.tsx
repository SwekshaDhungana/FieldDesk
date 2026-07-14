import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { DashboardPage } from "@/pages/DashboardPage";
import { TicketListPage } from "@/pages/TicketListPage";
import { TicketDetailPage } from "@/pages/TicketDetailPage";
import { TicketCreatePage } from "@/pages/TicketCreatePage";
import { TicketEditPage } from "@/pages/TicketEditPage";
import { OrganizationsPage } from "@/pages/OrganizationsPage";
import { StaffPage } from "@/pages/StaffPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { PermissionsPage } from "@/pages/PermissionsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />

          <Route
            path="/tickets"
            element={
              <ProtectedRoute permission="view_tickets">
                <TicketListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <ProtectedRoute permission="create_tickets">
                <TicketCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute permission="view_tickets">
                <TicketDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id/edit"
            element={
              <ProtectedRoute permission="edit_tickets">
                <TicketEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizations"
            element={
              <ProtectedRoute permission="view_organizations">
                <OrganizationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute permission="view_staff">
                <StaffPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute permission="view_analytics">
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/permissions"
            element={
              <ProtectedRoute permission="manage_permissions">
                <PermissionsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
