import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BarChart3,
  Users,
  FileText,
  Briefcase,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const adminMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Posts",
    href: "/admin/posts/reported",
    icon: FileText,
  },
  {
    title: "Oportunidades",
    href: "/admin/opportunities",
    icon: Briefcase,
  },
  {
    title: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Denúncias",
    href: "/admin/reports",
    icon: AlertTriangle,
  },
  {
    title: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
];

/**
 * Barra lateral de navegação do painel administrativo (desktop)
 * Exibe menu de navegação e botão de logout
 */
export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <span className="ml-2 text-sm text-muted-foreground">WeUnite</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {adminMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate(item.href)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

/**
 * Barra lateral de navegação do painel administrativo (mobile)
 * Menu hamburguer responsivo para dispositivos móveis
 */
export function AdminMobileSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Admin Panel</SheetTitle>
          <SheetDescription>Painel administrativo da WeUnite</SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col space-y-2 mt-6">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => navigate(item.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
