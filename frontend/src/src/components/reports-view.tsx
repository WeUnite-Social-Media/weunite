import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AlertCircle, FileText, Briefcase, User, Search } from "lucide-react";
import { ReportDetailsDrawer } from "./report-details-drawer";

type ReportType = "post" | "opportunity" | "user";
type ReportStatus = "pending" | "under_review" | "resolved" | "rejected";

interface Report {
  id: number;
  type: ReportType;
  targetName: string;
  targetInitials: string;
  reportedBy: string;
  reporterInitials: string;
  reason: string;
  description: string;
  status: ReportStatus;
  date: string;
  severity: "low" | "medium" | "high";
}

const mockReports: Report[] = [
  {
    id: 1,
    type: "post",
    targetName: "Post de Pedro Lima",
    targetInitials: "PL",
    reportedBy: "Maria Silva",
    reporterInitials: "MS",
    reason: "Conteúdo inapropriado",
    description: "O post contém linguagem ofensiva e ataca outros usuários",
    status: "pending",
    date: "2 horas atrás",
    severity: "high",
  },
  {
    id: 2,
    type: "user",
    targetName: "Carlos Santos",
    targetInitials: "CS",
    reportedBy: "Ana Costa",
    reporterInitials: "AC",
    reason: "Assédio",
    description: "Usuário enviou mensagens ofensivas repetidamente",
    status: "under_review",
    date: "5 horas atrás",
    severity: "high",
  },
  {
    id: 3,
    type: "opportunity",
    targetName: "Vaga Falsa - Desenvolvedor",
    targetInitials: "VF",
    reportedBy: "João Oliveira",
    reporterInitials: "JO",
    reason: "Fraude/Spam",
    description: "Vaga solicita pagamento antecipado, parece ser golpe",
    status: "pending",
    date: "1 dia atrás",
    severity: "high",
  },
  {
    id: 4,
    type: "post",
    targetName: "Post de Laura Mendes",
    targetInitials: "LM",
    reportedBy: "Ricardo Souza",
    reporterInitials: "RS",
    reason: "Spam",
    description: "Post promocional repetitivo sem valor para comunidade",
    status: "pending",
    date: "1 dia atrás",
    severity: "medium",
  },
  {
    id: 5,
    type: "user",
    targetName: "Fake Account",
    targetInitials: "FA",
    reportedBy: "Patricia Lima",
    reporterInitials: "PL",
    reason: "Perfil falso",
    description: "Perfil usando fotos e informações de outra pessoa",
    status: "resolved",
    date: "2 dias atrás",
    severity: "medium",
  },
  {
    id: 6,
    type: "post",
    targetName: "Post de André Costa",
    targetInitials: "AC",
    reportedBy: "Beatriz Santos",
    reporterInitials: "BS",
    reason: "Informação falsa",
    description: "Post contém notícias falsas sobre saúde",
    status: "under_review",
    date: "3 dias atrás",
    severity: "high",
  },
  {
    id: 7,
    type: "opportunity",
    targetName: "Empresa XYZ - Designer",
    targetInitials: "XY",
    reportedBy: "Fernando Alves",
    reporterInitials: "FA",
    reason: "Conteúdo enganoso",
    description: "Descrição da vaga não corresponde à realidade",
    status: "rejected",
    date: "4 dias atrás",
    severity: "low",
  },
];

const statusLabels: Record<ReportStatus, string> = {
  pending: "Pendente",
  under_review: "Em análise",
  resolved: "Resolvida",
  rejected: "Rejeitada",
};

const typeLabels: Record<ReportType, string> = {
  post: "Post",
  opportunity: "Oportunidade",
  user: "Usuário",
};

const severityColors = {
  low: "text-yellow-600",
  medium: "text-orange-600",
  high: "text-red-600",
};

export function ReportsView() {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredReports = mockReports.filter((report) => {
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesSearch =
      report.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const pendingCount = mockReports.filter((r) => r.status === "pending").length;
  const underReviewCount = mockReports.filter(
    (r) => r.status === "under_review",
  ).length;
  const highSeverityCount = mockReports.filter(
    (r) =>
      r.severity === "high" &&
      r.status !== "resolved" &&
      r.status !== "rejected",
  ).length;

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
    setDrawerOpen(true);
  };

  const handleReportAction = (action: string) => {
    console.log(
      `Ação "${action}" executada para denúncia #${selectedReport?.id}`,
    );
    setDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Denúncias Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <h3>{pendingCount}</h3>
            <p className="text-muted-foreground mt-1">Aguardando revisão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Em Análise</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <h3>{underReviewCount}</h3>
            <p className="text-muted-foreground mt-1">Sendo revisadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Alta Severidade</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <h3>{highSeverityCount}</h3>
            <p className="text-muted-foreground mt-1">
              Requerem atenção urgente
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Denúncias</CardTitle>
          <CardDescription>
            Revise e tome ações sobre denúncias recebidas
          </CardDescription>

          <div className="flex gap-4 pt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar denúncias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="opportunity">Oportunidades</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="under_review">Em análise</SelectItem>
                <SelectItem value="resolved">Resolvida</SelectItem>
                <SelectItem value="rejected">Rejeitada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Alvo</TableHead>
                <TableHead>Denunciado por</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[100px]">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    Nenhuma denúncia encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {report.type === "post" && (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        {report.type === "opportunity" && (
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                        )}
                        {report.type === "user" && (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{typeLabels[report.type]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {report.targetInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="max-w-[200px] truncate">
                          {report.targetName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {report.reporterInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span>{report.reportedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {report.reason}
                    </TableCell>
                    <TableCell>
                      <div
                        className={`flex items-center gap-1 ${severityColors[report.severity]}`}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span className="capitalize">
                          {report.severity === "high"
                            ? "Alta"
                            : report.severity === "medium"
                              ? "Média"
                              : "Baixa"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          report.status === "pending"
                            ? "default"
                            : report.status === "under_review"
                              ? "secondary"
                              : report.status === "resolved"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {statusLabels[report.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.date}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReportClick(report)}
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

      <ReportDetailsDrawer
        report={selectedReport}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAction={handleReportAction}
      />
    </div>
  );
}
