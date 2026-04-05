import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { isAdminUser } from "@/shared/lib/isAdminUser";

/**
 * Componente de debug para desenvolvimento
 * Exibe informações de autenticação e permissões de admin
 * @dev Deve ser removido em produção
 */
export function AdminDebugInfo() {
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = isAdminUser(user);

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded text-xs z-50">
      <div>Logado: {isAuthenticated ? "Sim" : "Não"}</div>
      <div>Email: {user?.email || "N/A"}</div>
      <div>Role: {user?.role || "N/A"}</div>
      <div>É Admin: {isAdmin ? "Sim" : "Não"}</div>
      <div>User.isAdmin: {user?.isAdmin ? "Sim" : "Não"}</div>
    </div>
  );
}
