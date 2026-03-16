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
exports.ReportModal = ReportModal;
var react_1 = require("react");
var dialog_1 = require("@/shared/components/ui/dialog");
var button_1 = require("@/shared/components/ui/button");
var label_1 = require("@/shared/components/ui/label");
var Select_1 = require("@/shared/components/ui/Select");
var textarea_1 = require("@/shared/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var reportService_1 = require("@/features/reporting/api/reportService");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var sonner_1 = require("sonner");
var REPORT_REASONS = [
    { value: "spam", label: "Spam ou conteúdo enganoso" },
    { value: "harassment", label: "Assédio ou bullying" },
    { value: "inappropriate_content", label: "Conteúdo inadequado ou ofensivo" },
    { value: "fake_profile", label: "Perfil falso" },
    { value: "fake_opportunity", label: "Oportunidade falsa" },
    { value: "copyright_violation", label: "Violação de direitos autorais" },
    { value: "violence", label: "Violência ou ameaças" },
    { value: "hate_speech", label: "Discurso de ódio" },
    { value: "misinformation", label: "Desinformação" },
    { value: "other", label: "Outros" },
];
function ReportModal(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, entityType = _a.entityType, entityId = _a.entityId, entityTitle = _a.entityTitle;
    var _b = (0, react_1.useState)(""), reason = _b[0], setReason = _b[1];
    var _c = (0, react_1.useState)(""), description = _c[0], setDescription = _c[1];
    var _d = (0, react_1.useState)(false), isSubmitting = _d[0], setIsSubmitting = _d[1];
    var user = (0, useAuthStore_1.useAuthStore)(function (state) { return state.user; });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!reason) {
                        sonner_1.toast.error("Por favor, selecione um motivo para a denúncia");
                        return [2 /*return*/];
                    }
                    if (!user) {
                        sonner_1.toast.error("Você precisa estar logado para fazer uma denúncia");
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    return [4 /*yield*/, (0, reportService_1.createReportRequest)(Number(user.id), {
                            type: entityType,
                            entityId: entityId,
                            reason: description || reason,
                        })];
                case 1:
                    response = _a.sent();
                    setIsSubmitting(false);
                    if (response.success) {
                        sonner_1.toast.success(response.message ||
                            "Denúncia enviada com sucesso! Nossa equipe irá analisá-la em breve.");
                        setReason("");
                        setDescription("");
                        onOpenChange(false);
                    }
                    else {
                        sonner_1.toast.error("Erro ao enviar den\u00FAncia: ".concat(response.error));
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[500px]">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.AlertTriangle className="h-5 w-5 text-red-600"/>
            Denunciar {entityType === "POST" ? "Post" : "Oportunidade"}
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Sua denúncia será analisada pela nossa equipe. Use este recurso
            apenas para conteúdos que violem nossas diretrizes.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {entityTitle && (<div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Denunciando: <span className="font-medium">{entityTitle}</span>
              </p>
            </div>)}

          <div className="space-y-2">
            <label_1.Label htmlFor="reason">Motivo da denúncia *</label_1.Label>
            <Select_1.Select value={reason} onValueChange={setReason}>
              <Select_1.SelectTrigger id="reason">
                <Select_1.SelectValue placeholder="Selecione o motivo"/>
              </Select_1.SelectTrigger>
              <Select_1.SelectContent>
                {REPORT_REASONS.map(function (r) { return (<Select_1.SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </Select_1.SelectItem>); })}
              </Select_1.SelectContent>
            </Select_1.Select>
          </div>

          <div className="space-y-2">
            <label_1.Label htmlFor="description">Detalhes adicionais (opcional)</label_1.Label>
            <textarea_1.Textarea id="description" placeholder="Adicione mais informações sobre a denúncia..." value={description} onChange={function (e) { return setDescription(e.target.value); }} rows={4} maxLength={500}/>
            <p className="text-xs text-muted-foreground">
              {description.length}/500 caracteres
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-900">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Aviso:</strong> Denúncias falsas podem resultar em
              penalidades para sua conta.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button_1.Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }} disabled={isSubmitting}>
              Cancelar
            </button_1.Button>
            <button_1.Button type="submit" variant="destructive" disabled={isSubmitting || !reason}>
              {isSubmitting ? (<>
                  <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Enviando...
                </>) : ("Enviar Denúncia")}
            </button_1.Button>
          </div>
        </form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
