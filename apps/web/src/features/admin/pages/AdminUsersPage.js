"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUsersPage = AdminUsersPage;
var AdminLayout_1 = require("@/features/admin/components/AdminLayout");
var card_1 = require("@/shared/components/ui/card");
var button_1 = require("@/shared/components/ui/button");
var input_1 = require("@/shared/components/ui/input");
var badge_1 = require("@/shared/components/ui/badge");
var table_1 = require("@/shared/components/ui/table");
var dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Mock data - substituir por dados reais da API
var mockUsers = [
    {
        id: "1",
        name: "João Silva",
        email: "joao@email.com",
        username: "joaosilva",
        role: "athlete",
        status: "active",
        lastLogin: "2024-10-15",
        postCount: 23,
        reportCount: 0,
    },
    {
        id: "2",
        name: "Tech Solutions Ltd",
        email: "contato@techsolutions.com",
        username: "techsolutions",
        role: "company",
        status: "active",
        lastLogin: "2024-10-14",
        postCount: 15,
        reportCount: 1,
    },
    {
        id: "3",
        name: "Maria Santos",
        email: "maria@email.com",
        username: "mariasantos",
        role: "athlete",
        status: "suspended",
        lastLogin: "2024-10-10",
        postCount: 8,
        reportCount: 3,
    },
];
function AdminUsersPage() {
    var _a = (0, react_1.useState)(""), searchTerm = _a[0], setSearchTerm = _a[1];
    var _b = (0, react_1.useState)("all"), statusFilter = _b[0], setStatusFilter = _b[1];
    var filteredUsers = mockUsers.filter(function (user) {
        var matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesStatus = statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    var getStatusBadge = function (status) {
        switch (status) {
            case "active":
                return (<badge_1.Badge variant="default" className="bg-green-100 text-green-800">
            Ativo
          </badge_1.Badge>);
            case "suspended":
                return <badge_1.Badge variant="destructive">Suspenso</badge_1.Badge>;
            case "banned":
                return <badge_1.Badge variant="destructive">Banido</badge_1.Badge>;
            default:
                return <badge_1.Badge variant="secondary">{status}</badge_1.Badge>;
        }
    };
    var getRoleBadge = function (role) {
        var normalizedRole = role === null || role === void 0 ? void 0 : role.toLowerCase().trim();
        if (normalizedRole === "company") {
            return (<badge_1.Badge variant="outline" className="bg-blue-50 text-blue-700">
          Empresa
        </badge_1.Badge>);
        }
        return (<badge_1.Badge variant="outline" className="bg-purple-50 text-purple-700">
        Atleta
      </badge_1.Badge>);
    };
    return (<AdminLayout_1.AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie usuários da plataforma
            </p>
          </div>
        </div>

        {/* Filtros */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Filtros</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <input_1.Input placeholder="Buscar por nome, email ou username..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
              </div>
              <select value={statusFilter} onChange={function (e) { return setStatusFilter(e.target.value); }} className="px-3 py-2 border rounded-md bg-background">
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
                <option value="banned">Banido</option>
              </select>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Tabela de usuários */}
        <card_1.Card>
          <card_1.CardContent className="p-0">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Usuário</table_1.TableHead>
                  <table_1.TableHead>Tipo</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  <table_1.TableHead>Último Login</table_1.TableHead>
                  <table_1.TableHead>Posts</table_1.TableHead>
                  <table_1.TableHead>Denúncias</table_1.TableHead>
                  <table_1.TableHead className="w-[50px]">Ações</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredUsers.map(function (user) { return (<table_1.TableRow key={user.id}>
                    <table_1.TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          @{user.username} • {user.email}
                        </div>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>{getRoleBadge(user.role)}</table_1.TableCell>
                    <table_1.TableCell>{getStatusBadge(user.status)}</table_1.TableCell>
                    <table_1.TableCell>
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </table_1.TableCell>
                    <table_1.TableCell>{user.postCount}</table_1.TableCell>
                    <table_1.TableCell>
                      {user.reportCount > 0 ? (<badge_1.Badge variant="destructive">{user.reportCount}</badge_1.Badge>) : (user.reportCount)}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                          <button_1.Button variant="ghost" size="icon">
                            <lucide_react_1.MoreVertical className="h-4 w-4"/>
                          </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end">
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Eye className="mr-2 h-4 w-4"/>
                            Visualizar Perfil
                          </dropdown_menu_1.DropdownMenuItem>
                          {user.status === "active" ? (<dropdown_menu_1.DropdownMenuItem className="text-orange-600">
                              <lucide_react_1.UserX className="mr-2 h-4 w-4"/>
                              Suspender
                            </dropdown_menu_1.DropdownMenuItem>) : (<dropdown_menu_1.DropdownMenuItem className="text-green-600">
                              <lucide_react_1.UserCheck className="mr-2 h-4 w-4"/>
                              Ativar
                            </dropdown_menu_1.DropdownMenuItem>)}
                          <dropdown_menu_1.DropdownMenuItem className="text-blue-600">
                            <lucide_react_1.Shield className="mr-2 h-4 w-4"/>
                            Definir como Admin
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                      </dropdown_menu_1.DropdownMenu>
                    </table_1.TableCell>
                  </table_1.TableRow>); })}
              </table_1.TableBody>
            </table_1.Table>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </AdminLayout_1.AdminLayout>);
}
