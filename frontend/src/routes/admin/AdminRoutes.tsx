import { Route, Routes } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminReportsPage } from "@/pages/admin/AdminReportsPage";
import { ReportedPostsPage } from "@/pages/admin/ReportedPostsPage";
import { AdminModerationDemo } from "@/pages/admin/AdminModerationDemo";

// Lista temporária de emails de administradores (até o backend estar pronto)
const ADMIN_EMAILS = [
  "admin@weunite.com",
  "luiz@weunite.com",
  "matheus@weunite.com",
  "matheusoliveirale2007@gmail.com",
  "manoel_jonathan@hotmail.com", // Email do usuário
  // Adicione outros emails de admin conforme necessário
];

function AdminProtectedRoutes() {
  const { isAuthenticated, user } = useAuthStore();

  // Verifica se o usuário está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Verifica se o usuário é administrador
  // Por enquanto, usando email até o backend estar pronto
  const isAdmin =
    user?.isAdmin || (user?.email && ADMIN_EMAILS.includes(user.email));

  if (!isAdmin) {
    // Redireciona para home se não for admin
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
        <Route path="/moderation-demo" element={<AdminModerationDemo />} />
        {/* Adicionar outras rotas admin aqui */}
      </Route>
    </Routes>
  );
}
