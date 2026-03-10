import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Eye,
} from "lucide-react";
import { useState } from "react";

// Mock data - substituir por dados reais da API
const mockUsers = [
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

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        );
      case "suspended":
        return <Badge variant="destructive">Suspenso</Badge>;
      case "banned":
        return <Badge variant="destructive">Banido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const normalizedRole = role?.toLowerCase().trim();

    if (normalizedRole === "company") {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Empresa
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700">
        Atleta
      </Badge>
    );
  };

  return (
    <AdminLayout>
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
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
                <option value="banned">Banido</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de usuários */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Denúncias</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          @{user.username} • {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{user.postCount}</TableCell>
                    <TableCell>
                      {user.reportCount > 0 ? (
                        <Badge variant="destructive">{user.reportCount}</Badge>
                      ) : (
                        user.reportCount
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar Perfil
                          </DropdownMenuItem>
                          {user.status === "active" ? (
                            <DropdownMenuItem className="text-orange-600">
                              <UserX className="mr-2 h-4 w-4" />
                              Suspender
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600">
                              <UserCheck className="mr-2 h-4 w-4" />
                              Ativar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-blue-600">
                            <Shield className="mr-2 h-4 w-4" />
                            Definir como Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
