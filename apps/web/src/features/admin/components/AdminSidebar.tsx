import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  FileText,
  LogOut,
  Menu,
  MessageSquare,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

const adminMenuItems = [
  { title: "Dashboard", href: "/admin", icon: BarChart3 },
  { title: "Posts", href: "/admin/posts/reported", icon: FileText },
  {
    title: "Oportunidades",
    href: "/admin/opportunities/reported",
    icon: Briefcase,
  },
  {
    title: "Comentários",
    href: "/admin/comments/reported",
    icon: MessageSquare,
  },
  { title: "Usuários", href: "/admin/users", icon: Users },
  { title: "Denúncias", href: "/admin/reports", icon: AlertTriangle },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return location.pathname === href;
    }

    return location.pathname.startsWith(href);
  };

  return (
    <div className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r bg-background md:flex">
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
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => navigate("/home")}
        >
          Sair do Admin
        </Button>
      </div>
    </div>
  );
}

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

        <nav className="mt-6 flex flex-col space-y-2">
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
