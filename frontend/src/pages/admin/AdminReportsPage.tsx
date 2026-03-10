import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { ReportDetailsModal } from "@/components/admin/ReportDetailsModal";
import type { Report } from "@/@types/report.types";

/**
 * Dados mockados de denúncias
 * TODO: Substituir por dados reais da API
 */
const mockReports: Report[] = [
  {
    id: "1",
    reportedBy: { name: "João Silva", username: "joaosilva" },
    reportedUser: { name: "Pedro Lima", username: "pedrolima" },
    reason: "harassment",
    description: "Usuário enviando mensagens ofensivas",
    status: "pending",
    createdAt: "2024-10-15",
    content: "Post ofensivo sobre....",
  },
  {
    id: "2",
    reportedBy: { name: "Maria Santos", username: "mariasantos" },
    reportedUser: { name: "Tech Corp", username: "techcorp" },
    reason: "fake_opportunity",
    description: "Oportunidade falsa publicada pela empresa",
    status: "under_review",
    createdAt: "2024-10-14",
    content: "Vaga de desenvolvedor com salário irreal",
  },
  {
    id: "3",
    reportedBy: { name: "Carlos Oliveira", username: "carlosoliveira" },
    reportedUser: { name: "Ana Costa", username: "anacosta" },
    reason: "spam",
    description: "Múltiplas publicações repetitivas",
    status: "resolved",
    createdAt: "2024-10-13",
    content: "Spam sobre curso online",
  },
];

/**
 * Página de gerenciamento de denúncias
 */
export function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const filteredReports = mockReports.filter((report) => {
    return statusFilter === "all" || report.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="destructive"
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Pendente
          </Badge>
        );
      case "under_review":
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-600 bg-blue-50"
          >
            Em Análise
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-green-600 bg-green-50"
          >
            Resolvido
          </Badge>
        );
      case "dismissed":
        return <Badge variant="secondary">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReasonBadge = (reason: string) => {
    const reasonMap: Record<string, string> = {
      spam: "Spam",
      harassment: "Assédio",
      inappropriate_content: "Conteúdo Inadequado",
      fake_profile: "Perfil Falso",
      fake_opportunity: "Oportunidade Falsa",
      copyright_violation: "Violação de Direitos",
      other: "Outros",
    };

    return <Badge variant="outline">{reasonMap[reason] || reason}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Denúncias</h1>
            <p className="text-muted-foreground">
              Gerencie denúncias e relatórios da plataforma
            </p>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Denúncias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resolvidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">10</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="under_review">Em Análise</option>
                <option value="resolved">Resolvido</option>
                <option value="dismissed">Rejeitado</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de denúncias */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Denunciante</TableHead>
                  <TableHead>Denunciado</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {report.reportedBy.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{report.reportedBy.username}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {report.reportedUser.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{report.reportedUser.username}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getReasonBadge(report.reason)}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReport(report)}
                      >
                        Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
    </AdminLayout>
  );
}
