"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OpportunityDetailModal;
var dialog_1 = require("@/shared/components/ui/dialog");
var sheet_1 = require("@/shared/components/ui/sheet");
var button_1 = require("@/shared/components/ui/button");
var react_router_dom_1 = require("react-router-dom");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
function OpportunityDetailModal(_a) {
    var opportunity = _a.opportunity, isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var handleGoToOpportunity = function () {
        onOpenChange(false);
        navigate("/opportunity");
    };
    var OpportunityContent = function () { return (<div className="space-y-6">
      {/* Título e Empresa */}
      <div>
        <h3 className="text-2xl font-bold mb-2">{opportunity.title}</h3>
        {opportunity.company && (<div className="flex items-center gap-2 text-muted-foreground">
            <lucide_react_1.Briefcase className="w-4 h-4"/>
            <span className="text-sm">{opportunity.company.name}</span>
          </div>)}
      </div>

      {/* Informações principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {opportunity.location && (<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <lucide_react_1.MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0"/>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Localização</p>
              <p className="text-sm font-medium">{opportunity.location}</p>
            </div>
          </div>)}

        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <lucide_react_1.Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0"/>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Data Limite</p>
            <p className="text-sm font-medium">
              {(0, date_fns_1.format)(new Date(opportunity.dateEnd), "dd 'de' MMMM 'de' yyyy", {
            locale: locale_1.ptBR,
        })}
            </p>
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <span>Descrição</span>
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {opportunity.description}
        </p>
      </div>

      {/* Habilidades */}
      {opportunity.skills && opportunity.skills.length > 0 && (<div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <lucide_react_1.Tag className="w-4 h-4"/>
            <span>Habilidades Requeridas</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {opportunity.skills.map(function (skill) { return (<span key={skill.id} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {skill.name}
              </span>); })}
          </div>
        </div>)}

      {/* Botão de ação */}
      <div className="pt-4">
        <button_1.Button onClick={handleGoToOpportunity} className="w-full" size="lg">
          Ir para Oportunidade
        </button_1.Button>
      </div>
    </div>); };
    if (isMobile) {
        return (<sheet_1.Sheet open={isOpen} onOpenChange={onOpenChange}>
        <sheet_1.SheetContent side="bottom" className="h-[90vh]">
          <sheet_1.SheetHeader className="text-left mb-6">
            <sheet_1.SheetTitle>Detalhes da Oportunidade</sheet_1.SheetTitle>
            <sheet_1.SheetDescription>
              Veja todas as informações sobre esta oportunidade
            </sheet_1.SheetDescription>
          </sheet_1.SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            <OpportunityContent />
          </div>
        </sheet_1.SheetContent>
      </sheet_1.Sheet>);
    }
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Detalhes da Oportunidade</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Veja todas as informações sobre esta oportunidade
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>
        <OpportunityContent />
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
