"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminHeader = AdminHeader;
var AdminSidebar_1 = require("./AdminSidebar");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var ThemeProvider_1 = require("@/shared/providers/ThemeProvider");
var button_1 = require("@/shared/components/ui/button");
var lucide_react_1 = require("lucide-react");
/**
 * Cabeçalho do painel administrativo
 * Exibe informações do usuário admin, controle de tema e menu mobile
 */
function AdminHeader() {
    var _a;
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var _b = (0, ThemeProvider_1.useTheme)(), theme = _b.theme, setTheme = _b.setTheme;
    var toggleTheme = function () {
        setTheme(theme === "dark" ? "light" : "dark");
    };
    return (<header className="h-16 border-b bg-background flex items-center justify-between px-4 md:ml-64">
      <div className="flex items-center gap-4">
        <AdminSidebar_1.AdminMobileSidebar />
        <div className="hidden md:block">
          <h2 className="text-lg font-semibold">Dashboard Administrativo</h2>
          <p className="text-sm text-muted-foreground">
            Bem-vindo ao painel de controle da rede social
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button_1.Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {theme === "dark" ? (<lucide_react_1.Sun className="h-4 w-4"/>) : (<lucide_react_1.Moon className="h-4 w-4"/>)}
        </button_1.Button>

        <div className="text-right">
          <p className="text-sm font-medium">{user === null || user === void 0 ? void 0 : user.name}</p>
          <p className="text-xs text-muted-foreground">Administrador</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
          {(_a = user === null || user === void 0 ? void 0 : user.name) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>);
}
