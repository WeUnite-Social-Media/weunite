"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminReportsPage = AdminReportsPage;
var AdminLayout_1 = require("@/features/admin/components/AdminLayout");
var card_1 = require("@/shared/components/ui/card");
var button_1 = require("@/shared/components/ui/button");
var badge_1 = require("@/shared/components/ui/badge");
var table_1 = require("@/shared/components/ui/table");
var react_1 = require("react");
var ReportDetailsModal_1 = require("@/features/admin/components/ReportDetailsModal");
/**
 * Dados mockados de denúncias
 * TODO: Substituir por dados reais da API
 */
var mockReports = [
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
function AdminReportsPage() {
    var _a = (0, react_1.useState)("all"), statusFilter = _a[0], setStatusFilter = _a[1];
    var _b = (0, react_1.useState)(null), selectedReport = _b[0], setSelectedReport = _b[1];
    var _c = (0, react_1.useState)(false), isModalOpen = _c[0], setIsModalOpen = _c[1];
    var handleViewReport = function (report) {
        setSelectedReport(report);
        setIsModalOpen(true);
    };
    var filteredReports = mockReports.filter(function (report) {
        return statusFilter === "all" || report.status === statusFilter;
    });
    var getStatusBadge = function (status) {
        switch (status) {
            case "pending":
                return (<badge_1.Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-700">
            Pendente
          </badge_1.Badge>);
            case "under_review":
                return (<badge_1.Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
            Em Análise
          </badge_1.Badge>);
            case "resolved":
                return (<badge_1.Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
            Resolvido
          </badge_1.Badge>);
            case "dismissed":
                return <badge_1.Badge variant="secondary">Rejeitado</badge_1.Badge>;
            default:
                return <badge_1.Badge variant="secondary">{status}</badge_1.Badge>;
        }
    };
    var getReasonBadge = function (reason) {
        var reasonMap = {
            spam: "Spam",
            harassment: "Assédio",
            inappropriate_content: "Conteúdo Inadequado",
            fake_profile: "Perfil Falso",
            fake_opportunity: "Oportunidade Falsa",
            copyright_violation: "Violação de Direitos",
            other: "Outros",
        };
        return <badge_1.Badge variant="outline">{reasonMap[reason] || reason}</badge_1.Badge>;
    };
    return (<AdminLayout_1.AdminLayout>
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
          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Denúncias
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">23</div>
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-yellow-600">5</div>
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Em Análise
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-blue-600">8</div>
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Resolvidas
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-green-600">10</div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Filtros */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Filtros</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex gap-4">
              <select value={statusFilter} onChange={function (e) { return setStatusFilter(e.target.value); }} className="px-3 py-2 border rounded-md bg-background">
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="under_review">Em Análise</option>
                <option value="resolved">Resolvido</option>
                <option value="dismissed">Rejeitado</option>
              </select>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Tabela de denúncias */}
        <card_1.Card>
          <card_1.CardContent className="p-0">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Denunciante</table_1.TableHead>
                  <table_1.TableHead>Denunciado</table_1.TableHead>
                  <table_1.TableHead>Motivo</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  <table_1.TableHead>Data</table_1.TableHead>
                  <table_1.TableHead className="text-right">Ações</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredReports.map(function (report) { return (<table_1.TableRow key={report.id}>
                    <table_1.TableCell>
                      <div>
                        <div className="font-medium">
                          {report.reportedBy.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{report.reportedBy.username}
                        </div>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div>
                        <div className="font-medium">
                          {report.reportedUser.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{report.reportedUser.username}
                        </div>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>{getReasonBadge(report.reason)}</table_1.TableCell>
                    <table_1.TableCell>{getStatusBadge(report.status)}</table_1.TableCell>
                    <table_1.TableCell>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </table_1.TableCell>
                    <table_1.TableCell className="text-right">
                      <button_1.Button variant="outline" size="sm" onClick={function () { return handleViewReport(report); }}>
                        Revisar
                      </button_1.Button>
                    </table_1.TableCell>
                  </table_1.TableRow>); })}
              </table_1.TableBody>
            </table_1.Table>
          </card_1.CardContent>
        </card_1.Card>

        <ReportDetailsModal_1.ReportDetailsModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} report={selectedReport}/>
      </div>
    </AdminLayout_1.AdminLayout>);
}
