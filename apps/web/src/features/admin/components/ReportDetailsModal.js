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
exports.ReportDetailsModal = ReportDetailsModal;
var dialog_1 = require("@/shared/components/ui/dialog");
var button_1 = require("@/shared/components/ui/button");
var badge_1 = require("@/shared/components/ui/badge");
var avatar_1 = require("@/shared/components/ui/avatar");
var separator_1 = require("@/shared/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var adminService_1 = require("@/features/admin/api/adminService");
var react_1 = require("react");
/**
 * Modal de detalhes de denúncia para administradores
 */
function ReportDetailsModal(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, report = _a.report, onActionComplete = _a.onActionComplete;
    var _b = (0, react_1.useState)(false), isLoading = _b[0], setIsLoading = _b[1];
    if (!report)
        return null;
    var getReportTarget = function () {
        if (report.entityId === undefined ||
            (report.entityType !== "POST" && report.entityType !== "OPPORTUNITY")) {
            sonner_1.toast.error("Não foi possível identificar a entidade reportada.");
            return null;
        }
        return {
            entityId: report.entityId,
            entityType: report.entityType,
        };
    };
    var getReasonText = function (reason) {
        var reasonMap = {
            spam: "Spam",
            harassment: "Assédio",
            inappropriate_content: "Conteúdo Inadequado",
            fake_profile: "Perfil Falso",
            fake_opportunity: "Oportunidade Falsa",
            copyright_violation: "Violação de Direitos",
            other: "Outros",
        };
        return reasonMap[reason] || reason;
    };
    var handleResolve = function () { return __awaiter(_this, void 0, void 0, function () {
        var target, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    target = getReportTarget();
                    if (!target)
                        return [2 /*return*/];
                    setIsLoading(true);
                    return [4 /*yield*/, (0, adminService_1.resolveReportsRequest)(target.entityId, target.entityType)];
                case 1:
                    response = _a.sent();
                    setIsLoading(false);
                    if (response.success) {
                        sonner_1.toast.success(response.message || "Denúncia resolvida com sucesso!");
                        onOpenChange(false);
                        onActionComplete === null || onActionComplete === void 0 ? void 0 : onActionComplete();
                    }
                    else {
                        sonner_1.toast.error(response.error || "Erro ao resolver denúncia");
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var handleReject = function () { return __awaiter(_this, void 0, void 0, function () {
        var target, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    target = getReportTarget();
                    if (!target)
                        return [2 /*return*/];
                    setIsLoading(true);
                    return [4 /*yield*/, (0, adminService_1.dismissReportsRequest)(target.entityId, target.entityType)];
                case 1:
                    response = _a.sent();
                    setIsLoading(false);
                    if (response.success) {
                        sonner_1.toast.success(response.message || "Denúncia rejeitada com sucesso!");
                        onOpenChange(false);
                        onActionComplete === null || onActionComplete === void 0 ? void 0 : onActionComplete();
                    }
                    else {
                        sonner_1.toast.error(response.error || "Erro ao rejeitar denúncia");
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var handleAnalyze = function () { return __awaiter(_this, void 0, void 0, function () {
        var target, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    target = getReportTarget();
                    if (!target)
                        return [2 /*return*/];
                    setIsLoading(true);
                    return [4 /*yield*/, (0, adminService_1.markReportsAsReviewedRequest)(target.entityId, target.entityType)];
                case 1:
                    response = _a.sent();
                    setIsLoading(false);
                    if (response.success) {
                        sonner_1.toast.success(response.message || "Denúncia marcada como em análise!");
                        onOpenChange(false);
                        onActionComplete === null || onActionComplete === void 0 ? void 0 : onActionComplete();
                    }
                    else {
                        sonner_1.toast.error(response.error || "Erro ao marcar denúncia como em análise");
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <dialog_1.DialogHeader className="space-y-3">
          <dialog_1.DialogTitle className="text-xl">Detalhes da Denúncia</dialog_1.DialogTitle>
          <p className="text-sm text-muted-foreground">
            Revise as informações e tome as ações necessárias
          </p>
        </dialog_1.DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações da Denúncia */}
          <div className="grid grid-cols-2 gap-4">
            {/* Denunciante */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Denunciante
              </h4>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <avatar_1.Avatar className="h-10 w-10">
                  <avatar_1.AvatarImage src={"https://api.dicebear.com/7.x/avataaars/svg?seed=".concat(report.reportedBy.username)}/>
                  <avatar_1.AvatarFallback>
                    <lucide_react_1.User className="h-4 w-4"/>
                  </avatar_1.AvatarFallback>
                </avatar_1.Avatar>
                <div>
                  <p className="font-medium">{report.reportedBy.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{report.reportedBy.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Denunciado */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Denunciado
              </h4>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <avatar_1.Avatar className="h-10 w-10">
                  <avatar_1.AvatarImage src={"https://api.dicebear.com/7.x/avataaars/svg?seed=".concat(report.reportedUser.username)}/>
                  <avatar_1.AvatarFallback>
                    <lucide_react_1.User className="h-4 w-4"/>
                  </avatar_1.AvatarFallback>
                </avatar_1.Avatar>
                <div>
                  <p className="font-medium">{report.reportedUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{report.reportedUser.username}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <separator_1.Separator />

          {/* Motivo e Descrição */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Motivo</h4>
              <badge_1.Badge variant="outline" className="text-sm">
                {getReasonText(report.reason)}
              </badge_1.Badge>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Descrição</h4>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm">{report.description}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Conteúdo Reportado</h4>
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                {report.content && (<p className="text-sm text-muted-foreground">
                    {report.content}
                  </p>)}
                {report.imageUrl && (<div className="rounded-lg overflow-hidden border border-border">
                    <img src={report.imageUrl} alt="Conteúdo do post" className="w-full h-auto object-cover max-h-96"/>
                  </div>)}
                {!report.content && !report.imageUrl && (<p className="text-sm text-muted-foreground italic">
                    Nenhum conteúdo disponível
                  </p>)}
              </div>
            </div>
          </div>

          <separator_1.Separator />

          {/* Informações Adicionais */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Data:</span>
              <span className="ml-2 font-medium">
                {new Date(report.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">ID:</span>
              <span className="ml-2 font-mono text-xs">#{report.id}</span>
            </div>
          </div>

          <separator_1.Separator />

          {/* Ações */}
          <div>
            <h4 className="text-sm font-medium mb-3">Ações de Moderação</h4>
            <div className="space-y-2">
              {report.status === "pending" && (<button_1.Button variant="outline" className="w-full justify-start gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/20" onClick={handleAnalyze} disabled={isLoading}>
                  <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                  {isLoading ? "Processando..." : "Marcar como Em Análise"}
                </button_1.Button>)}
              <button_1.Button variant="outline" className="w-full justify-start gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-950/20" onClick={handleResolve} disabled={isLoading}>
                <lucide_react_1.CheckCircle className="h-4 w-4"/>
                {isLoading ? "Processando..." : "Resolver Denúncia"}
              </button_1.Button>
              <button_1.Button variant="outline" className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20" onClick={handleReject} disabled={isLoading}>
                <lucide_react_1.XCircle className="h-4 w-4"/>
                {isLoading ? "Processando..." : "Rejeitar Denúncia"}
              </button_1.Button>
            </div>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
