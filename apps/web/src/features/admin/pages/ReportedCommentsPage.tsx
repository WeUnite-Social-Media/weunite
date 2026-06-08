import { useEffect, useState } from "react";
import {
  FileText,
  Flag,
  Image,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { ReportDetailsModal } from "@/features/admin/components/ReportDetailsModal";
import {
  deleteCommentByAdminRequest,
  dismissReportsRequest,
  getReportedCommentsDetailsRequest,
  restoreCommentByAdminRequest,
} from "@/features/admin/api/adminService";
import { getReportStatusBadge } from "@/features/admin/utils/adminBadges";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import type { Report, ReportedComment } from "@/shared/types/admin.types";

function normalizeStatus(status: string): Report["status"] {
  switch (status.toLowerCase()) {
    case "reviewed":
    case "under_review":
      return "under_review";
    case "dismissed":
      return "dismissed";
    case "deleted":
      return "deleted";
    case "hidden":
      return "hidden";
    case "pending":
      return "pending";
    default:
      return "resolved";
  }
}

export function ReportedCommentsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportedComments, setReportedComments] = useState<ReportedComment[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadReportedComments = async () => {
    setIsLoading(true);
    const response = await getReportedCommentsDetailsRequest();

    if (response.success && response.data) {
      setReportedComments(response.data);
    } else {
      toast.error(
        response.error ||
          "Não foi possível carregar os comentários denunciados.",
      );
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadReportedComments();
  }, []);

  const handleReview = (reportedComment: ReportedComment) => {
    const firstReport = reportedComment.reports[0];

    if (!firstReport) {
      return;
    }

    setSelectedReport({
      id: firstReport.id,
      entityId: Number(reportedComment.comment.id),
      entityType: "COMMENT",
      reportedBy: {
        id: firstReport.reporter.id,
        name: firstReport.reporter.name,
        username: firstReport.reporter.username,
        profileImg: firstReport.reporter.profileImg,
      },
      reportedUser: {
        id: reportedComment.comment.user.id,
        name: reportedComment.comment.user.name,
        username: reportedComment.comment.user.username,
        profileImg: reportedComment.comment.user.profileImg,
      },
      reason: firstReport.reason,
      description: `Comentário denunciado ${reportedComment.totalReports} vez(es).`,
      status: normalizeStatus(reportedComment.status),
      createdAt: firstReport.createdAt,
      content: reportedComment.comment.text || "",
      imageUrl: reportedComment.comment.imageUrl || undefined,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (commentId: number) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja deletar este comentário?",
    );
    if (!confirmed) {
      return;
    }

    const response = await deleteCommentByAdminRequest(commentId);

    if (response.success) {
      toast.success(response.message || "Comentário deletado com sucesso!");
      void loadReportedComments();
      return;
    }

    toast.error(response.error || "Erro ao deletar comentário");
  };

  const handleRestore = async (commentId: number) => {
    const response = await restoreCommentByAdminRequest(commentId);

    if (response.success) {
      toast.success(response.message || "Comentário restaurado com sucesso!");
      void loadReportedComments();
      return;
    }

    toast.error(response.error || "Erro ao restaurar comentário");
  };

  const handleDismiss = async (commentId: number) => {
    const response = await dismissReportsRequest(commentId, "COMMENT");

    if (response.success) {
      toast.success(response.message || "Denúncias descartadas com sucesso!");
      void loadReportedComments();
      return;
    }

    toast.error(response.error || "Erro ao descartar denúncias");
  };

  const filteredComments = reportedComments.filter((item) => {
    const normalizedStatus = normalizeStatus(item.status);
    const matchesStatus =
      statusFilter === "all" || normalizedStatus === statusFilter;
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return matchesStatus;
    }

    return (
      matchesStatus &&
      ((item.comment.text || "").toLowerCase().includes(query) ||
        item.comment.user.name.toLowerCase().includes(query))
    );
  });

  const totalReports = reportedComments.reduce(
    (count, item) => count + item.totalReports,
    0,
  );
  const pendingCount = reportedComments.filter(
    (item) => normalizeStatus(item.status) === "pending",
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Comentários Denunciados</h1>
          <p className="text-muted-foreground">
            Revise e modere comentários reportados pelos usuários.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comentários denunciados
              </CardTitle>
              <Flag className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportedComments.length}
              </div>
              <p className="text-xs text-muted-foreground">Requerem atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando revisão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de denúncias
              </CardTitle>
              <Image className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
              <p className="text-xs text-muted-foreground">Recebidas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciar comentários denunciados</CardTitle>
            <div className="flex flex-col gap-4 pt-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar por autor ou conteúdo..."
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="under_review">Em análise</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="dismissed">Rejeitado</SelectItem>
                  <SelectItem value="deleted">Deletado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Denúncias</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Carregando comentários denunciados...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredComments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Nenhum comentário denunciado encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComments.map((item) => {
                      const status = normalizeStatus(item.status);
                      const isActionable =
                        status === "pending" || status === "under_review";

                      return (
                        <TableRow key={item.comment.id}>
                          <TableCell className="max-w-md">
                            <div className="space-y-1">
                              <p className="font-medium">
                                {item.comment.user.name}
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                {item.comment.text}
                              </p>
                              {item.comment.imageUrl ? (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Image className="h-3 w-3" />
                                  <span>Com mídia</span>
                                </div>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="bg-red-600">
                              {item.totalReports} denúncia
                              {item.totalReports === 1 ? "" : "s"}
                            </Badge>
                          </TableCell>
                          <TableCell>{getReportStatusBadge(status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(
                              item.reports[0]?.createdAt,
                            ).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReview(item)}
                              >
                                {isActionable ? "Revisar" : "Ver detalhes"}
                              </Button>

                              {status === "deleted" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRestore(Number(item.comment.id))
                                  }
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Restaurar
                                </Button>
                              ) : isActionable ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDismiss(Number(item.comment.id))
                                    }
                                  >
                                    Descartar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleDelete(Number(item.comment.id))
                                    }
                                  >
                                    Deletar
                                  </Button>
                                </>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
          onActionComplete={loadReportedComments}
        />
      </div>
    </AdminLayout>
  );
}
