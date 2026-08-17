import { Route, Routes } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";
import { AdminReportsPage } from "@/features/admin/pages/AdminReportsPage";
import { ReportedCommentsPage } from "@/features/admin/pages/ReportedCommentsPage";
import { ReportedOpportunitiesPage } from "@/features/admin/pages/ReportedOpportunitiesPage";
import { ReportedPostsPage } from "@/features/admin/pages/ReportedPostsPage";
import { AdminModerationDemo } from "@/features/admin/pages/AdminModerationDemo";
import { isAdminUser } from "@/shared/lib/isAdminUser";
import { useSessionGuard } from "@/app/routes/useSessionGuard";

function AdminProtectedRoutes() {
  const { isAuthenticated, user } = useAuthStore();
  const sessionState = useSessionGuard();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (sessionState === "checking") {
    return null;
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminProtectedRoutes />}>
        <Route path="/" element={<AdminDashboardPage />} />
        <Route path="/dashboard" element={<AdminDashboardPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/reports" element={<AdminReportsPage />} />
        <Route path="/posts/reported" element={<ReportedPostsPage />} />
        <Route
          path="/opportunities/reported"
          element={<ReportedOpportunitiesPage />}
        />
        <Route path="/comments/reported" element={<ReportedCommentsPage />} />
        <Route path="/moderation-demo" element={<AdminModerationDemo />} />
      </Route>
    </Routes>
  );
}
