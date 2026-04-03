import { useEffect, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  FileText,
  MessageSquare,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { toast } from "sonner";
import type {
  Report,
  ReportedComment,
  ReportedOpportunity,
  ReportedPost,
} from "@/shared/types/admin.types";
import {
  getReportedCommentsDetailsRequest,
  getReportedOpportunitiesDetailsRequest,
  getReportedPostsDetailsRequest,
} from "@/features/admin/api/adminService";
import { getReportReasonBadge, getReportStatusBadge } from "@/features/admin/utils/adminBadges";
import { ReportDetailsModal } from "@/features/admin/components/ReportDetailsModal";

const typeLabels: Record<NonNullable<Report["entityType"]>, string> = {
  POST: "Post",
  USER: "Usuário",
  OPPORTUNITY: "Oportunidade",
  COMMENT: "Comentário",
};

function normalizeReportStatus(status: string): Report["status"] {
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
    case "resolved":
    default:
      return status.toLowerCase() === "pending" ? "pending" : "resolved";
  }
}

export function ReportsView() {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState<Report[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);

      const [postsResponse, opportunitiesResponse, commentsResponse] =
        await Promise.all([
          getReportedPostsDetailsRequest(),
          getReportedOpportunitiesDetailsRequest(),
          getReportedCommentsDetailsRequest(),
        ]);

      if (
        !postsResponse.success &&
        !opportunitiesResponse.success &&
        !commentsResponse.success
      ) {
        toast.error("Não foi possível carregar as denúncias.");
        setLoading(false);
        return;
      }

      const allReports: Report[] = [];

      postsResponse.data?.forEach((reportedPost: ReportedPost) => {
        reportedPost.reports.forEach((report) => {
          allReports.push({
            id: report.id,
            entityId: Number(reportedPost.post.id),
            entityType: "POST",
            reportedBy: {
              id: report.reporter.id,
              name: report.reporter.name,
              username: report.reporter.username,
              profileImg: report.reporter.profileImg,
            },
            reportedUser: {
              id: reportedPost.post.user.id,
              name: reportedPost.post.user.name,
              username: reportedPost.post.user.username,
              profileImg: reportedPost.post.user.profileImg,
            },
            reason: report.reason,
            description: `Post denunciado ${reportedPost.totalReports} vez(es).`,
            status: normalizeReportStatus(reportedPost.status),
            createdAt: report.createdAt,
            content: reportedPost.post.text,
            imageUrl: reportedPost.post.imageUrl || undefined,
          });
        });
      });

      opportunitiesResponse.data?.forEach(
        (reportedOpportunity: ReportedOpportunity) => {
          reportedOpportunity.reports.forEach((report) => {
            allReports.push({
              id: report.id,
              entityId: Number(reportedOpportunity.opportunity.id),
              entityType: "OPPORTUNITY",
              reportedBy: {
                id: report.reporter.id,
                name: report.reporter.name,
                username: report.reporter.username,
                profileImg: report.reporter.profileImg,
              },
              reportedUser: {
                id: reportedOpportunity.opportunity.company?.id,
                name:
                  reportedOpportunity.opportunity.company?.name ||
                  "Empresa desconhecida",
                username:
                  reportedOpportunity.opportunity.company?.username || "empresa",
                profileImg:
                  reportedOpportunity.opportunity.company?.profileImg,
              },
              reason: report.reason,
              description: `Oportunidade denunciada ${reportedOpportunity.totalReports} vez(es).`,
              status: normalizeReportStatus(reportedOpportunity.status),
              createdAt: report.createdAt,
              content: reportedOpportunity.opportunity.description,
            });
          });
        },
      );

      commentsResponse.data?.forEach((reportedComment: ReportedComment) => {
        reportedComment.reports.forEach((report) => {
          allReports.push({
            id: report.id,
            entityId: Number(reportedComment.comment.id),
            entityType: "COMMENT",
            reportedBy: {
              id: report.reporter.id,
              name: report.reporter.name,
              username: report.reporter.username,
              profileImg: report.reporter.profileImg,
            },
            reportedUser: {
              id: reportedComment.comment.user.id,
              name: reportedComment.comment.user.name,
              username: reportedComment.comment.user.username,
              profileImg: reportedComment.comment.user.profileImg,
            },
            reason: report.reason,
            description: `Comentário denunciado ${reportedComment.totalReports} vez(es).`,
            status: normalizeReportStatus(reportedComment.status),
            createdAt: report.createdAt,
            content: reportedComment.comment.text || "",
            imageUrl: reportedComment.comment.imageUrl || undefined,
          });
        });
      });

      allReports.sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );

      setReportsData(allReports);
      setLoading(false);
    };

    void loadReports();
  }, []);

  const filteredReports = reportsData.filter((report) => {
    const matchesType =
      filterType === "all" || report.entityType === filterType;
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return matchesType && matchesStatus;
    }

    return (
      matchesType &&
      matchesStatus &&
      (report.reportedUser.name.toLowerCase().includes(query) ||
        report.reportedBy.name.toLowerCase().includes(query) ||
        report.reason.toLowerCase().includes(query))
    );
  });

  const pendingCount = reportsData.filter((report) => report.status === "pending").length;
  const underReviewCount = reportsData.filter(
    (report) => report.status === "under_review",
  ).length;
  const resolvedCount = reportsData.filter(
    (report) => report.status === "resolved" || report.status === "dismissed",
  ).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Carregando denúncias...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Aguardando análise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em análise</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underReviewCount}</div>
            <p className="text-xs text-muted-foreground">Sendo revisadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground">Fechadas pela equipe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.length}</div>
            <p className="text-xs text-muted-foreground">Todas as denúncias</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar denúncias</CardTitle>
          <CardDescription>
            Revise e tome ações sobre denúncias recebidas.
          </CardDescription>

          <div className="flex flex-col gap-4 pt-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar denúncias..."
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="POST">Posts</SelectItem>
                <SelectItem value="OPPORTUNITY">Oportunidades</SelectItem>
                <SelectItem value="COMMENT">Comentários</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="under_review">Em análise</SelectItem>
                <SelectItem value="resolved">Resolvida</SelectItem>
                <SelectItem value="dismissed">Rejeitada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Denunciado</TableHead>
                <TableHead>Denunciante</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[110px]">Ação</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Nenhuma denúncia encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={`${report.entityType}-${report.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {report.entityType === "POST" ? (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        ) : null}
                        {report.entityType === "OPPORTUNITY" ? (
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                        ) : null}
                        {report.entityType === "COMMENT" ? (
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        ) : null}
                        <span>{typeLabels[report.entityType || "POST"]}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={report.reportedUser.profileImg} />
                          <AvatarFallback>
                            {report.reportedUser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{report.reportedUser.name}</p>
                          <p className="text-xs text-muted-foreground">
                            @{report.reportedUser.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={report.reportedBy.profileImg} />
                          <AvatarFallback>
                            {report.reportedBy.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{report.reportedBy.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>{getReportReasonBadge(report.reason)}</TableCell>
                    <TableCell>{getReportStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReport(report);
                          setIsModalOpen(true);
                        }}
                      >
                        Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReportDetailsModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        report={selectedReport}
      />
    </div>
  );
}
