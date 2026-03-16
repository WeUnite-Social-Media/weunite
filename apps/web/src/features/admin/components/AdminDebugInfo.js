"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDebugInfo = AdminDebugInfo;
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
/**
 * Componente de debug para desenvolvimento
 * Exibe informações de autenticação e permissões de admin
 * @dev Deve ser removido em produção
 */
function AdminDebugInfo() {
    var _a = (0, useAuthStore_1.useAuthStore)(), user = _a.user, isAuthenticated = _a.isAuthenticated;
    var ADMIN_EMAILS = [
        "admin@weunite.com",
        "luiz@weunite.com",
        "matheus@weunite.com",
        "matheusoliveirale2007@gmail.com",
        "manoel_jonathan@hotmail.com",
    ];
    var isAdmin = (user === null || user === void 0 ? void 0 : user.isAdmin) || ((user === null || user === void 0 ? void 0 : user.email) && ADMIN_EMAILS.includes(user.email));
    return (<div className="fixed top-4 right-4 bg-black text-white p-4 rounded text-xs z-50">
      <div>Logado: {isAuthenticated ? "Sim" : "Não"}</div>
      <div>Email: {(user === null || user === void 0 ? void 0 : user.email) || "N/A"}</div>
      <div>É Admin: {isAdmin ? "Sim" : "Não"}</div>
      <div>User.isAdmin: {(user === null || user === void 0 ? void 0 : user.isAdmin) ? "Sim" : "Não"}</div>
    </div>);
}
