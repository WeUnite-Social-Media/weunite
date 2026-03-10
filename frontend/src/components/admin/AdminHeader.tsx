import { AdminMobileSidebar } from "./AdminSidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

/**
 * Cabeçalho do painel administrativo
 * Exibe informações do usuário admin, controle de tema e menu mobile
 */
export function AdminHeader() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:ml-64">
      <div className="flex items-center gap-4">
        <AdminMobileSidebar />
        <div className="hidden md:block">
          <h2 className="text-lg font-semibold">Dashboard Administrativo</h2>
          <p className="text-sm text-muted-foreground">
            Bem-vindo ao painel de controle da rede social
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <div className="text-right">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">Administrador</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
