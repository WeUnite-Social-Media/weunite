"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSidebar = AdminSidebar;
exports.AdminMobileSidebar = AdminMobileSidebar;
var button_1 = require("@/shared/components/ui/button");
var sheet_1 = require("@/shared/components/ui/sheet");
var lucide_react_1 = require("lucide-react");
var react_router_dom_1 = require("react-router-dom");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var adminMenuItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: lucide_react_1.BarChart3,
    },
    {
        title: "Posts",
        href: "/admin/posts/reported",
        icon: lucide_react_1.FileText,
    },
    {
        title: "Oportunidades",
        href: "/admin/opportunities",
        icon: lucide_react_1.Briefcase,
    },
    {
        title: "Usuários",
        href: "/admin/users",
        icon: lucide_react_1.Users,
    },
    {
        title: "Denúncias",
        href: "/admin/reports",
        icon: lucide_react_1.AlertTriangle,
    },
    {
        title: "Configurações",
        href: "/admin/settings",
        icon: lucide_react_1.Settings,
    },
];
/**
 * Barra lateral de navegação do painel administrativo (desktop)
 * Exibe menu de navegação e botão de logout
 */
function AdminSidebar() {
    var navigate = (0, react_router_dom_1.useNavigate)();
    var location = (0, react_router_dom_1.useLocation)();
    var logout = (0, useAuthStore_1.useAuthStore)().logout;
    var handleLogout = function () {
        logout();
        navigate("/auth/login");
    };
    var isActiveRoute = function (href) {
        if (href === "/admin") {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };
    return (<div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <span className="ml-2 text-sm text-muted-foreground">WeUnite</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {adminMenuItems.map(function (item) {
            var Icon = item.icon;
            return (<button_1.Button key={item.href} variant={isActiveRoute(item.href) ? "secondary" : "ghost"} className="w-full justify-start" onClick={function () { return navigate(item.href); }}>
              <Icon className="mr-2 h-4 w-4"/>
              {item.title}
            </button_1.Button>);
        })}
      </nav>

      <div className="border-t p-4">
        <button_1.Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
          <lucide_react_1.LogOut className="mr-2 h-4 w-4"/>
          Sair
        </button_1.Button>
      </div>
    </div>);
}
/**
 * Barra lateral de navegação do painel administrativo (mobile)
 * Menu hamburguer responsivo para dispositivos móveis
 */
function AdminMobileSidebar() {
    var navigate = (0, react_router_dom_1.useNavigate)();
    var location = (0, react_router_dom_1.useLocation)();
    var logout = (0, useAuthStore_1.useAuthStore)().logout;
    var handleLogout = function () {
        logout();
        navigate("/auth/login");
    };
    var isActiveRoute = function (href) {
        if (href === "/admin") {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };
    return (<sheet_1.Sheet>
      <sheet_1.SheetTrigger asChild>
        <button_1.Button variant="ghost" size="icon" className="md:hidden">
          <lucide_react_1.Menu className="h-5 w-5"/>
        </button_1.Button>
      </sheet_1.SheetTrigger>
      <sheet_1.SheetContent side="left" className="w-80">
        <sheet_1.SheetHeader>
          <sheet_1.SheetTitle>Admin Panel</sheet_1.SheetTitle>
          <sheet_1.SheetDescription>Painel administrativo da WeUnite</sheet_1.SheetDescription>
        </sheet_1.SheetHeader>

        <nav className="flex flex-col space-y-2 mt-6">
          {adminMenuItems.map(function (item) {
            var Icon = item.icon;
            return (<button_1.Button key={item.href} variant={isActiveRoute(item.href) ? "secondary" : "ghost"} className="justify-start" onClick={function () { return navigate(item.href); }}>
                <Icon className="mr-2 h-4 w-4"/>
                {item.title}
              </button_1.Button>);
        })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button_1.Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700" onClick={handleLogout}>
            <lucide_react_1.LogOut className="mr-2 h-4 w-4"/>
            Sair
          </button_1.Button>
        </div>
      </sheet_1.SheetContent>
    </sheet_1.Sheet>);
}
