import { useEffect, useState } from "react";
import {
  Briefcase,
  Flag,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { ReportDetailsModal } from "@/features/admin/components/ReportDetailsModal";
import {
  deleteOpportunityByAdminRequest,
  dismissReportsRequest,
  getReportedOpportunitiesDetailsRequest,
  restoreOpportunityByAdminRequest,
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
import type { Report, ReportedOpportunity } from "@/shared/types/admin.types";

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

export function ReportedOpportunitiesPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportedOpportunities, setReportedOpportunities] = useState<
    ReportedOpportunity[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReportedOpportunities = async () => {
    setIsLoading(true);
    const response = await getReportedOpportunitiesDetailsRequest();

    if (response.success && response.data) {
      setReportedOpportunities(response.data);
    } else {
      toast.error(
        response.error ||
          "Não foi possível carregar as oportunidades denunciadas.",
      );
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadReportedOpportunities();
  }, []);

  const handleReview = (reportedOpportunity: ReportedOpportunity) => {
    const firstReport = reportedOpportunity.reports[0];

    if (!firstReport) {
      return;
    }

    setSelectedReport({
      id: firstReport.id,
      entityId: Number(reportedOpportunity.opportunity.id),
      entityType: "OPPORTUNITY",
      reportedBy: {
        id: firstReport.reporter.id,
        name: firstReport.reporter.name,
        username: firstReport.reporter.username,
        profileImg: firstReport.reporter.profileImg,
      },
      reportedUser: {
        id: reportedOpportunity.opportunity.company?.id,
        name:
          reportedOpportunity.opportunity.company?.name || "Empresa desconhecida",
        username:
          reportedOpportunity.opportunity.company?.username || "empresa",
        profileImg: reportedOpportunity.opportunity.company?.profileImg,
      },
      reason: firstReport.reason,
      description: `Oportunidade denunciada ${reportedOpportunity.totalReports} vez(es).`,
      status: normalizeStatus(reportedOpportunity.status),
      createdAt: firstReport.createdAt,
      content: reportedOpportunity.opportunity.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (opportunityId: number) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja deletar esta oportunidade?",
    );
    if (!confirmed) {
      return;
    }

    const response = await deleteOpportunityByAdminRequest(opportunityId);

    if (response.success) {
      toast.success(response.message || "Oportunidade deletada com sucesso!");
      void loadReportedOpportunities();
      return;
    }

    toast.error(response.error || "Erro ao deletar oportunidade");
  };

  const handleRestore = async (opportunityId: number) => {
    const response = await restoreOpportunityByAdminRequest(opportunityId);

    if (response.success) {
      toast.success(response.message || "Oportunidade restaurada com sucesso!");
      void loadReportedOpportunities();
      return;
    }

    toast.error(response.error || "Erro ao restaurar oportunidade");
  };

  const handleDismiss = async (opportunityId: number) => {
    const response = await dismissReportsRequest(opportunityId, "OPPORTUNITY");

    if (response.success) {
      toast.success(response.message || "Denúncias descartadas com sucesso!");
      void loadReportedOpportunities();
      return;
    }

    toast.error(response.error || "Erro ao descartar denúncias");
  };

  const filteredOpportunities = reportedOpportunities.filter((item) => {
    const normalizedStatus = normalizeStatus(item.status);
    const matchesStatus =
      statusFilter === "all" || normalizedStatus === statusFilter;
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return matchesStatus;
    }

    return (
      matchesStatus &&
      (item.opportunity.title.toLowerCase().includes(query) ||
        item.opportunity.description.toLowerCase().includes(query) ||
        (item.opportunity.company?.name || "").toLowerCase().includes(query))
    );
  });

  const totalReports = reportedOpportunities.reduce(
    (count, item) => count + item.totalReports,
    0,
  );
  const pendingCount = reportedOpportunities.filter(
    (item) => normalizeStatus(item.status) === "pending",
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Oportunidades Denunciadas</h1>
          <p className="text-muted-foreground">
            Revise e modere oportunidades reportadas pelos usuários.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Oportunidades denunciadas
              </CardTitle>
              <Flag className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportedOpportunities.length}
              </div>
              <p className="text-xs text-muted-foreground">Requerem atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Briefcase className="h-4 w-4 text-orange-600" />
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
              <MapPin className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
              <p className="text-xs text-muted-foreground">Recebidas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciar oportunidades denunciadas</CardTitle>
            <div className="flex flex-col gap-4 pt-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar por título, empresa ou descrição..."
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
                  <SelectItem value="resolved">Resolvida</SelectItem>
                  <SelectItem value="dismissed">Rejeitada</SelectItem>
                  <SelectItem value="deleted">Deletada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Oportunidade</TableHead>
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
                          <span>Carregando oportunidades denunciadas...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredOpportunities.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Nenhuma oportunidade denunciada encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOpportunities.map((item) => (
                      <TableRow key={item.opportunity.id}>
                        <TableCell className="max-w-md">
                          <div className="space-y-1">
                            <p className="font-medium">{item.opportunity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Por {item.opportunity.company?.name || "Empresa"}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {item.opportunity.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="bg-red-600">
                            {item.totalReports} denúncia
                            {item.totalReports === 1 ? "" : "s"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getReportStatusBadge(normalizeStatus(item.status))}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.reports[0]?.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReview(item)}
                            >
                              Revisar
                            </Button>

                            {normalizeStatus(item.status) === "deleted" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRestore(Number(item.opportunity.id))}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restaurar
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDismiss(Number(item.opportunity.id))
                                  }
                                >
                                  Descartar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleDelete(Number(item.opportunity.id))
                                  }
                                >
                                  Deletar
                                </Button>
                              </>
                            )}
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
          onActionComplete={loadReportedOpportunities}
        />
      </div>
    </AdminLayout>
  );
}
