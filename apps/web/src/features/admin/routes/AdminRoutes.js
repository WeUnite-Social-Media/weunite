"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = AdminRoutes;
var react_router_dom_1 = require("react-router-dom");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var react_router_dom_2 = require("react-router-dom");
var AdminDashboardPage_1 = require("@/features/admin/pages/AdminDashboardPage");
var AdminUsersPage_1 = require("@/features/admin/pages/AdminUsersPage");
var AdminReportsPage_1 = require("@/features/admin/pages/AdminReportsPage");
var ReportedPostsPage_1 = require("@/features/admin/pages/ReportedPostsPage");
var AdminModerationDemo_1 = require("@/features/admin/pages/AdminModerationDemo");
// Lista temporária de emails de administradores (até o backend estar pronto)
var ADMIN_EMAILS = [
    "admin@weunite.com",
    "luiz@weunite.com",
    "matheus@weunite.com",
    "matheusoliveirale2007@gmail.com",
    "manoel_jonathan@hotmail.com", // Email do usuário
    // Adicione outros emails de admin conforme necessário
];
function AdminProtectedRoutes() {
    var _a = (0, useAuthStore_1.useAuthStore)(), isAuthenticated = _a.isAuthenticated, user = _a.user;
    // Verifica se o usuário está autenticado
    if (!isAuthenticated) {
        return <react_router_dom_2.Navigate to="/auth/login" replace/>;
    }
    // Verifica se o usuário é administrador
    // Por enquanto, usando email até o backend estar pronto
    var isAdmin = (user === null || user === void 0 ? void 0 : user.isAdmin) || ((user === null || user === void 0 ? void 0 : user.email) && ADMIN_EMAILS.includes(user.email));
    if (!isAdmin) {
        // Redireciona para home se não for admin
        return <react_router_dom_2.Navigate to="/" replace/>;
    }
    return <react_router_dom_2.Outlet />;
}
function AdminRoutes() {
    return (<react_router_dom_1.Routes>
      <react_router_dom_1.Route element={<AdminProtectedRoutes />}>
        <react_router_dom_1.Route path="/" element={<AdminDashboardPage_1.AdminDashboardPage />}/>
        <react_router_dom_1.Route path="/dashboard" element={<AdminDashboardPage_1.AdminDashboardPage />}/>
        <react_router_dom_1.Route path="/users" element={<AdminUsersPage_1.AdminUsersPage />}/>
        <react_router_dom_1.Route path="/reports" element={<AdminReportsPage_1.AdminReportsPage />}/>
        <react_router_dom_1.Route path="/posts/reported" element={<ReportedPostsPage_1.ReportedPostsPage />}/>
        <react_router_dom_1.Route path="/moderation-demo" element={<AdminModerationDemo_1.AdminModerationDemo />}/>
        {/* Adicionar outras rotas admin aqui */}
      </react_router_dom_1.Route>
    </react_router_dom_1.Routes>);
}
