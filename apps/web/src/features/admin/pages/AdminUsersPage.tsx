import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Ban,
  Eye,
  Loader2,
  MoreVertical,
  RefreshCcw,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import {
  banAdminUserRequest,
  type AdminUsersPageResponse,
  getAdminUsersRequest,
  reactivateAdminUserRequest,
  suspendAdminUserRequest,
} from "@/features/admin/api/admin/userManagementService";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import type {
  AdminUserStatus,
  AdminUserSummary,
} from "@/shared/types/admin.types";
import { getInitials } from "@/shared/utils/getInitials";

const ADMIN_USERS_PAGE_SIZE = 20;

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [pagination, setPagination] = useState<AdminUsersPageResponse | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const authUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const adminId = authUser?.id ? Number(authUser.id) : null;
  const canModerateUsers = adminId !== null;

  const loadUsers = useCallback(async (page: number) => {
    setIsLoading(true);
    const response = await getAdminUsersRequest({
      page,
      size: ADMIN_USERS_PAGE_SIZE,
    });

    if (response.success && response.data) {
      setUsers(response.data.items);
      setPagination(response.data);
    } else {
      toast.error(response.error || "Nao foi possivel carregar os usuarios.");
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadUsers(currentPage);
  }, [currentPage, loadUsers]);

  const filteredUsers = users.filter((user) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: AdminUserStatus) => {
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

    if (normalizedRole === "admin") {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700">
          Admin
        </Badge>
      );
    }

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

  const totalPendingReports = users.reduce(
    (count, user) => count + user.pendingReportCount,
    0,
  );
  const moderatedUsers = users.filter(
    (user) => user.status !== "active",
  ).length;
  const totalUsers = pagination?.totalElements ?? users.length;
  const totalPages = pagination?.totalPages ?? 0;
  const pageLabel = totalPages > 0 ? currentPage + 1 : 0;

  const handleSuspend = async (user: AdminUserSummary) => {
    if (!canModerateUsers) {
      toast.error("Nao foi possivel identificar o admin autenticado.");
      return;
    }

    const rawDuration = window.prompt(
      `Por quantos dias deseja suspender @${user.username}?`,
      "7",
    );

    if (rawDuration === null) {
      return;
    }

    const durationInDays = Number(rawDuration);

    if (!Number.isFinite(durationInDays) || durationInDays <= 0) {
      toast.error("Informe uma duracao valida em dias.");
      return;
    }

    const reasonInput = window.prompt(
      `Motivo da suspensao de @${user.username}?`,
      "Suspensao administrativa",
    );

    if (reasonInput === null) {
      return;
    }

    setActiveUserId(user.id);
    const response = await suspendAdminUserRequest({
      userId: user.id,
      durationInDays,
      reason: reasonInput.trim() || "Suspensao administrativa",
    });
    setActiveUserId(null);

    if (response.success) {
      toast.success(response.message || "Usuario suspenso com sucesso.");
      void loadUsers(currentPage);
      return;
    }

    toast.error(response.error || "Nao foi possivel suspender o usuario.");
  };

  const handleBan = async (user: AdminUserSummary) => {
    if (!canModerateUsers) {
      toast.error("Nao foi possivel identificar o admin autenticado.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja banir permanentemente @${user.username}?`,
    );

    if (!confirmed) {
      return;
    }

    const reasonInput = window.prompt(
      `Motivo do banimento de @${user.username}?`,
      "Banimento administrativo",
    );

    if (reasonInput === null) {
      return;
    }

    setActiveUserId(user.id);
    const response = await banAdminUserRequest({
      userId: user.id,
      reason: reasonInput.trim() || "Banimento administrativo",
    });
    setActiveUserId(null);

    if (response.success) {
      toast.success(response.message || "Usuario banido com sucesso.");
      void loadUsers(currentPage);
      return;
    }

    toast.error(response.error || "Nao foi possivel banir o usuario.");
  };

  const handleReactivate = async (user: AdminUserSummary) => {
    if (!canModerateUsers) {
      toast.error("Nao foi possivel identificar o admin autenticado.");
      return;
    }

    const confirmed = window.confirm(
      `Deseja reativar a conta de @${user.username}?`,
    );

    if (!confirmed) {
      return;
    }

    setActiveUserId(user.id);
    const response = await reactivateAdminUserRequest({
      userId: user.id,
    });
    setActiveUserId(null);

    if (response.success) {
      toast.success(response.message || "Usuario reativado com sucesso.");
      void loadUsers(currentPage);
      return;
    }

    toast.error(response.error || "Nao foi possivel reativar o usuario.");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-muted-foreground">
              Gerencie usuarios da plataforma com dados reais de moderacao.
            </p>
          </div>
          <Button variant="outline" onClick={() => void loadUsers(currentPage)}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Usuarios monitorados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Contas disponiveis para administracao
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Em moderacao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderatedUsers}</div>
              <p className="text-xs text-muted-foreground">
                Suspensos ou banidos nesta pagina
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Denuncias pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPendingReports}</div>
              <p className="text-xs text-muted-foreground">
                Ligadas ao conteudo desta pagina
              </p>
            </CardContent>
          </Card>
        </div>

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
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="banned">Banido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Busca e status filtram apenas os usuarios carregados nesta pagina.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b px-4 py-3 text-sm text-muted-foreground">
              <span>
                Pagina {pageLabel} de {totalPages} ({totalUsers} usuarios)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading || !pagination?.hasPrevious}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 0))
                  }
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading || !pagination?.hasNext}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  Proxima
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Conteudos</TableHead>
                  <TableHead>Denuncias</TableHead>
                  <TableHead className="w-[50px]">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Carregando usuarios...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhum usuario encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const isOwnUser = adminId === user.id;
                    const isActionLoading = activeUserId === user.id;
                    const isModerationDisabled =
                      isActionLoading || isOwnUser || !canModerateUsers;

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.profileImg || undefined} />
                              <AvatarFallback>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                @{user.username} • {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(user.status)}
                            {user.status === "suspended" &&
                            user.suspendedUntil ? (
                              <p className="text-xs text-muted-foreground">
                                Ate{" "}
                                {new Date(
                                  user.suspendedUntil,
                                ).toLocaleDateString("pt-BR")}
                              </p>
                            ) : null}
                            {user.status === "banned" && user.bannedAt ? (
                              <p className="text-xs text-muted-foreground">
                                Desde{" "}
                                {new Date(user.bannedAt).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </p>
                            ) : null}
                            {user.moderationReason ? (
                              <p className="max-w-xs truncate text-xs text-muted-foreground">
                                {user.moderationReason}
                              </p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>{user.contentCount}</TableCell>
                        <TableCell>
                          {user.pendingReportCount > 0 ? (
                            <Badge variant="destructive">
                              {user.pendingReportCount}
                            </Badge>
                          ) : (
                            user.pendingReportCount
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isActionLoading || !canModerateUsers}
                              >
                                {isActionLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/profile/${user.username}`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar perfil
                              </DropdownMenuItem>

                              {user.status === "active" ? (
                                <>
                                  <DropdownMenuItem
                                    className="text-orange-600"
                                    disabled={isModerationDisabled}
                                    onClick={() => void handleSuspend(user)}
                                  >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Suspender
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    disabled={isModerationDisabled}
                                    onClick={() => void handleBan(user)}
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Banir
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    className="text-green-600"
                                    disabled={isModerationDisabled}
                                    onClick={() => void handleReactivate(user)}
                                  >
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Reativar
                                  </DropdownMenuItem>
                                  {user.status === "suspended" ? (
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      disabled={isModerationDisabled}
                                      onClick={() => void handleBan(user)}
                                    >
                                      <Ban className="mr-2 h-4 w-4" />
                                      Banir
                                    </DropdownMenuItem>
                                  ) : null}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
