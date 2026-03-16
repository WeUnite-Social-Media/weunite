"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportedPostsPage = ReportedPostsPage;
var react_1 = require("react");
var ReportDetailsModal_1 = require("@/features/admin/components/ReportDetailsModal");
var button_1 = require("@/shared/components/ui/button");
var table_1 = require("@/shared/components/ui/table");
var badge_1 = require("@/shared/components/ui/badge");
var card_1 = require("@/shared/components/ui/card");
var input_1 = require("@/shared/components/ui/input");
var Select_1 = require("@/shared/components/ui/Select");
var lucide_react_1 = require("lucide-react");
var AdminLayout_1 = require("@/features/admin/components/AdminLayout");
var adminService_1 = require("@/features/admin/api/adminService");
var sonner_1 = require("sonner");
/**
 * Página de gerenciamento de posts denunciados
 */
function ReportedPostsPage() {
    var _this = this;
    var _a = (0, react_1.useState)(null), selectedReport = _a[0], setSelectedReport = _a[1];
    var _b = (0, react_1.useState)(false), isModalOpen = _b[0], setIsModalOpen = _b[1];
    var _c = (0, react_1.useState)(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = (0, react_1.useState)("all"), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = (0, react_1.useState)([]), reportedPosts = _e[0], setReportedPosts = _e[1];
    var _f = (0, react_1.useState)(true), isLoading = _f[0], setIsLoading = _f[1];
    (0, react_1.useEffect)(function () {
        loadReportedPosts();
    }, []);
    var loadReportedPosts = function () { return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    return [4 /*yield*/, (0, adminService_1.getReportedPostsDetailsRequest)()];
                case 1:
                    response = _a.sent();
                    if (response.success && response.data) {
                        setReportedPosts(response.data);
                    }
                    else {
                        console.error("Erro ao carregar posts denunciados:", response.error);
                        sonner_1.toast.error("Erro: ".concat(response.error || "Não foi possível carregar os posts denunciados"));
                    }
                    setIsLoading(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var normalizeReportStatus = function (status) {
        switch (status.toLowerCase()) {
            case "reviewed":
            case "under_review":
                return "under_review";
            case "dismissed":
                return "dismissed";
            case "resolved":
                return "resolved";
            case "pending":
            default:
                return "pending";
        }
    };
    var handleReviewPost = function (reportedPost) {
        // Pegar o primeiro report para exibir no modal
        var firstReport = reportedPost.reports[0];
        if (!firstReport)
            return;
        var report = {
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
            description: "Post denunciado por ".concat(firstReport.reason, ". Total de ").concat(reportedPost.totalReports, " den\u00FAncias."),
            status: normalizeReportStatus(firstReport.status),
            createdAt: firstReport.createdAt,
            content: reportedPost.post.text,
            imageUrl: reportedPost.post.imageUrl || undefined,
        };
        setSelectedReport(report);
        setIsModalOpen(true);
    };
    var handleDeletePost = function (postId) { return __awaiter(_this, void 0, void 0, function () {
        var confirmed, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    confirmed = window.confirm("Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.");
                    if (!confirmed)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, adminService_1.deletePostByAdminRequest)(Number(postId))];
                case 1:
                    response = _a.sent();
                    if (response.success) {
                        sonner_1.toast.success(response.message || "Post deletado com sucesso!");
                        loadReportedPosts(); // Recarrega a lista
                    }
                    else {
                        sonner_1.toast.error("Erro: ".concat(response.error || "Não foi possível deletar o post"));
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var handleDismissReports = function (postId) { return __awaiter(_this, void 0, void 0, function () {
        var confirmed, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    confirmed = window.confirm("Tem certeza que deseja descartar as denúncias deste post?");
                    if (!confirmed)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, adminService_1.dismissReportsRequest)(Number(postId), "POST")];
                case 1:
                    response = _a.sent();
                    if (response.success) {
                        sonner_1.toast.success(response.message || "Denúncias descartadas com sucesso!");
                        loadReportedPosts(); // Recarrega a lista
                    }
                    else {
                        sonner_1.toast.error("Erro: ".concat(response.error || "Não foi possível descartar as denúncias"));
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var getTimeAgoSimple = function (date) {
        var hours = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
        if (hours < 24) {
            return "".concat(hours, " horas atr\u00E1s");
        }
        var days = Math.floor(hours / 24);
        return "".concat(days, " ").concat(days === 1 ? "dia" : "dias", " atr\u00E1s");
    };
    var filteredPosts = reportedPosts.filter(function (reportedPost) {
        var matchesSearch = searchQuery
            ? reportedPost.post.text
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
                reportedPost.post.user.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            : true;
        var matchesStatus = statusFilter === "all" || reportedPost.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    var totalReports = reportedPosts.reduce(function (acc, rp) { return acc + rp.totalReports; }, 0);
    var pendingPosts = reportedPosts.filter(function (rp) { return rp.status === "pending"; }).length;
    return (<AdminLayout_1.AdminLayout>
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
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Posts Denunciados
              </card_1.CardTitle>
              <lucide_react_1.Flag className="h-4 w-4 text-red-600"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{reportedPosts.length}</div>
              <p className="text-xs text-muted-foreground">Requerem atenção</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Pendentes</card_1.CardTitle>
              <lucide_react_1.FileText className="h-4 w-4 text-orange-600"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{pendingPosts}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando revisão
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Total de Denúncias
              </card_1.CardTitle>
              <lucide_react_1.Heart className="h-4 w-4 text-blue-600"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
              <p className="text-xs text-muted-foreground">
                Denúncias recebidas
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Seção de Gerenciamento */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Posts Denunciados</card_1.CardTitle>
            <p className="text-sm text-muted-foreground">
              Revise e tome ações sobre posts reportados pelos usuários
            </p>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <input_1.Input placeholder="Buscar posts denunciados por autor ou conteúdo..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="pl-10"/>
              </div>
              <Select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                <Select_1.SelectTrigger className="w-full md:w-[200px]">
                  <Select_1.SelectValue placeholder="Todos os status"/>
                </Select_1.SelectTrigger>
                <Select_1.SelectContent>
                  <Select_1.SelectItem value="all">Todos os status</Select_1.SelectItem>
                  <Select_1.SelectItem value="pending">Pendente</Select_1.SelectItem>
                  <Select_1.SelectItem value="hidden">Oculto</Select_1.SelectItem>
                  <Select_1.SelectItem value="deleted">Deletado</Select_1.SelectItem>
                </Select_1.SelectContent>
              </Select_1.Select>
            </div>

            {/* Tabela de Posts */}
            <div className="rounded-lg border">
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Conteúdo</table_1.TableHead>
                    <table_1.TableHead>Denúncias</table_1.TableHead>
                    <table_1.TableHead>Engajamento</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Data</table_1.TableHead>
                    <table_1.TableHead className="text-right">Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {isLoading ? (<table_1.TableRow>
                      <table_1.TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>
                          <span>Carregando posts denunciados...</span>
                        </div>
                      </table_1.TableCell>
                    </table_1.TableRow>) : filteredPosts.length === 0 ? (<table_1.TableRow>
                      <table_1.TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum post denunciado no momento
                      </table_1.TableCell>
                    </table_1.TableRow>) : (filteredPosts.map(function (reportedPost) {
            var _a, _b;
            return (<table_1.TableRow key={reportedPost.post.id}>
                        <table_1.TableCell className="max-w-md">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {reportedPost.post.user.name}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {reportedPost.post.text}
                            </p>
                            {reportedPost.post.imageUrl && (<div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <lucide_react_1.Image className="h-3 w-3"/>
                                <span>Com mídia</span>
                              </div>)}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <badge_1.Badge variant="destructive" className="bg-red-600">
                            {reportedPost.totalReports} denúncias
                          </badge_1.Badge>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-1">
                              <lucide_react_1.Heart className="h-3 w-3 text-red-500"/>
                              <span>
                                {((_a = reportedPost.post.likes) === null || _a === void 0 ? void 0 : _a.length) || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>💬</span>
                              <span>
                                {((_b = reportedPost.post.comments) === null || _b === void 0 ? void 0 : _b.length) || 0}
                              </span>
                            </div>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <badge_1.Badge variant="outline" className={reportedPost.status === "pending"
                    ? "border-yellow-500 text-yellow-600"
                    : reportedPost.status === "hidden"
                        ? "border-orange-500 text-orange-600"
                        : "border-red-500 text-red-600"}>
                            {reportedPost.status === "pending"
                    ? "Pendente"
                    : reportedPost.status === "hidden"
                        ? "Oculto"
                        : "Deletado"}
                          </badge_1.Badge>
                        </table_1.TableCell>
                        <table_1.TableCell className="text-sm text-muted-foreground">
                          {getTimeAgoSimple(reportedPost.post.createdAt)}
                        </table_1.TableCell>
                        <table_1.TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <button_1.Button variant="outline" size="sm" onClick={function () { return handleReviewPost(reportedPost); }}>
                              Revisar
                            </button_1.Button>
                            <button_1.Button variant="outline" size="sm" onClick={function () {
                    return handleDismissReports(reportedPost.post.id);
                }}>
                              Descartar
                            </button_1.Button>
                            <button_1.Button variant="destructive" size="sm" onClick={function () {
                    return handleDeletePost(reportedPost.post.id);
                }}>
                              Deletar
                            </button_1.Button>
                          </div>
                        </table_1.TableCell>
                      </table_1.TableRow>);
        }))}
                </table_1.TableBody>
              </table_1.Table>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <ReportDetailsModal_1.ReportDetailsModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} report={selectedReport} onActionComplete={loadReportedPosts}/>
      </div>
    </AdminLayout_1.AdminLayout>);
}
