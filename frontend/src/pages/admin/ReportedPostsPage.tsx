import { useState, useEffect } from "react";
import { ReportDetailsModal } from "@/components/admin/ReportDetailsModal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { FileText, Flag, Heart, Search, Image, Loader2 } from "lucide-react";
import type { Report, ReportedPost } from "@/@types/report.types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  getReportedPostsDetailsRequest,
  deletePostByAdminRequest,
  dismissReportsRequest,
} from "@/api/services/adminService";
import { toast } from "sonner";

/**
 * Página de gerenciamento de posts denunciados
 */
export function ReportedPostsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportedPosts();
  }, []);

  const loadReportedPosts = async () => {
    setIsLoading(true);
    const response = await getReportedPostsDetailsRequest();

    if (response.success && response.data) {
      setReportedPosts(response.data);
    } else {
      console.error("Erro ao carregar posts denunciados:", response.error);
      toast.error(
        `Erro: ${response.error || "Não foi possível carregar os posts denunciados"}`,
      );
    }
    setIsLoading(false);
  };

  const handleReviewPost = (reportedPost: ReportedPost) => {
    // Pegar o primeiro report para exibir no modal
    const firstReport = reportedPost.reports[0];

    if (!firstReport) return;

    const report: Report = {
      id: firstReport.id,
      entityId: Number(reportedPost.post.id), // ID do post que foi denunciado
      entityType: "POST", // Tipo da entidade
      reportedBy: {
        name: firstReport.reporter.name,
        username: firstReport.reporter.username,
      },
      reportedUser: {
        name: reportedPost.post.user.name,
        username: reportedPost.post.user.username,
      },
      reason: firstReport.reason,
      description: `Post denunciado por ${firstReport.reason}. Total de ${reportedPost.totalReports} denúncias.`,
      status: firstReport.status.toLowerCase() as any,
      createdAt: firstReport.createdAt,
      content: reportedPost.post.text,
      imageUrl: reportedPost.post.imageUrl || undefined,
    };

    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.",
    );

    if (!confirmed) return;

    const response = await deletePostByAdminRequest(Number(postId));

    if (response.success) {
      toast.success(response.message || "Post deletado com sucesso!");
      loadReportedPosts(); // Recarrega a lista
    } else {
      toast.error(
        `Erro: ${response.error || "Não foi possível deletar o post"}`,
      );
    }
  };

  const handleDismissReports = async (postId: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja descartar as denúncias deste post?",
    );

    if (!confirmed) return;

    const response = await dismissReportsRequest(Number(postId), "POST");

    if (response.success) {
      toast.success(response.message || "Denúncias descartadas com sucesso!");
      loadReportedPosts(); // Recarrega a lista
    } else {
      toast.error(
        `Erro: ${response.error || "Não foi possível descartar as denúncias"}`,
      );
    }
  };

  const getTimeAgoSimple = (date: string) => {
    const hours = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60),
    );

    if (hours < 24) {
      return `${hours} horas atrás`;
    }

    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? "dia" : "dias"} atrás`;
  };

  const filteredPosts = reportedPosts.filter((reportedPost) => {
    const matchesSearch = searchQuery
      ? reportedPost.post.text
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        reportedPost.post.user.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "all" || reportedPost.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalReports = reportedPosts.reduce(
    (acc, rp) => acc + rp.totalReports,
    0,
  );
  const pendingPosts = reportedPosts.filter(
    (rp) => rp.status === "pending",
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold">Posts Denunciados</h1>
          <p className="text-muted-foreground">
            Gerencie e modere posts reportados pelos usuários
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Posts Denunciados
              </CardTitle>
              <Flag className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportedPosts.length}</div>
              <p className="text-xs text-muted-foreground">Requerem atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPosts}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando revisão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Denúncias
              </CardTitle>
              <Heart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
              <p className="text-xs text-muted-foreground">
                Denúncias recebidas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Gerenciamento */}
        <Card>
          <CardHeader>
            <CardTitle>Posts Denunciados</CardTitle>
            <p className="text-sm text-muted-foreground">
              Revise e tome ações sobre posts reportados pelos usuários
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar posts denunciados por autor ou conteúdo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="hidden">Oculto</SelectItem>
                  <SelectItem value="deleted">Deletado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabela de Posts */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Denúncias</TableHead>
                    <TableHead>Engajamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Carregando posts denunciados...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum post denunciado no momento
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((reportedPost) => (
                      <TableRow key={reportedPost.post.id}>
                        <TableCell className="max-w-md">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {reportedPost.post.user.name}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {reportedPost.post.text}
                            </p>
                            {reportedPost.post.imageUrl && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Image className="h-3 w-3" />
                                <span>Com mídia</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="bg-red-600">
                            {reportedPost.totalReports} denúncias
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span>
                                {reportedPost.post.likes?.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>💬</span>
                              <span>
                                {reportedPost.post.comments?.length || 0}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              reportedPost.status === "pending"
                                ? "border-yellow-500 text-yellow-600"
                                : reportedPost.status === "hidden"
                                  ? "border-orange-500 text-orange-600"
                                  : "border-red-500 text-red-600"
                            }
                          >
                            {reportedPost.status === "pending"
                              ? "Pendente"
                              : reportedPost.status === "hidden"
                                ? "Oculto"
                                : "Deletado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getTimeAgoSimple(reportedPost.post.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewPost(reportedPost)}
                            >
                              Revisar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDismissReports(reportedPost.post.id)
                              }
                            >
                              Descartar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeletePost(reportedPost.post.id)
                              }
                            >
                              Deletar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <ReportDetailsModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          report={selectedReport}
          onActionComplete={loadReportedPosts}
        />
      </div>
    </AdminLayout>
  );
}
