"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityDescription = OpportunityDescription;
var drawer_1 = require("@/shared/components/ui/drawer");
var button_1 = require("@/shared/components/ui/button");
var badge_1 = require("@/shared/components/ui/badge");
var avatar_1 = require("@/shared/components/ui/avatar");
var lucide_react_1 = require("lucide-react");
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
var dialog_1 = require("@/shared/components/ui/dialog");
var getInitials_1 = require("@/shared/utils/getInitials");
var useGetTimeAgo_1 = require("@/shared/hooks/useGetTimeAgo");
function OpportunityDescription(_a) {
    // const { user } = useAuthStore();
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, opportunity = _a.opportunity;
    var companyInitials = (0, getInitials_1.getInitials)(((_b = opportunity.company) === null || _b === void 0 ? void 0 : _b.name) || "");
    var commentDesktop = (0, useBreakpoints_1.useBreakpoints)().commentDesktop;
    var opportunityDate = new Date(opportunity.dateEnd).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    var handleApply = function () { };
    if (!commentDesktop) {
        return (<drawer_1.Drawer open={isOpen} onOpenChange={onOpenChange}>
        <drawer_1.DrawerContent className="h-[100vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh] mt-0 flex flex-col">
          <drawer_1.DrawerHeader className="pt-4 px-6 flex-shrink-0">
            <drawer_1.DrawerClose className="absolute rounded-sm transition-opacity right-4">
              <lucide_react_1.X className="h-5 w-5 hover:cursor-pointer"/>
            </drawer_1.DrawerClose>
            <drawer_1.DrawerTitle>Detalhes da Oportunidade</drawer_1.DrawerTitle>
          </drawer_1.DrawerHeader>

          <div className="flex flex-col w-full items-center overflow-y-auto px-4 py-6">
            {/* Cabeçalho da oportunidade */}
            <div className="w-full max-w-[45em] mb-6">
              <div className="flex items-center gap-3 mb-4">
                <avatar_1.Avatar className="h-12 w-12">
                  <avatar_1.AvatarImage src={(_c = opportunity.company) === null || _c === void 0 ? void 0 : _c.profileImg}/>
                  <avatar_1.AvatarFallback>{companyInitials}</avatar_1.AvatarFallback>
                </avatar_1.Avatar>
                <div>
                  <h2 className="text-xl font-bold">{opportunity.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {(_d = opportunity.company) === null || _d === void 0 ? void 0 : _d.name} • Publicado há{" "}
                    {(0, useGetTimeAgo_1.getTimeAgo)(opportunity.createdAt)}
                  </p>
                </div>
              </div>

              {/* Informações básicas */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <lucide_react_1.MapPin className="h-4 w-4"/>
                  {opportunity.location}
                </div>
                <div className="flex items-center gap-1">
                  <lucide_react_1.Calendar className="h-4 w-4"/>
                  {opportunityDate}
                </div>
                <div className="flex items-center gap-1">
                  <lucide_react_1.Users className="h-4 w-4"/>
                  {((_e = opportunity.subscribers) === null || _e === void 0 ? void 0 : _e.length) || 0} candidatos
                </div>
              </div>

              {/* Habilidades */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(_f = opportunity.skills) === null || _f === void 0 ? void 0 : _f.map(function (skill) { return (<badge_1.Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </badge_1.Badge>); })}
              </div>

              {/* Descrição */}
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="whitespace-pre-wrap">{opportunity.description}</p>
              </div>
            </div>

            {/* Botão de candidatura */}
            <div className="w-full max-w-[45em] border-t pt-4">
              <button_1.Button onClick={handleApply} className="w-full">
                Candidatar-se
              </button_1.Button>
            </div>
          </div>
        </drawer_1.DrawerContent>
      </drawer_1.Drawer>);
    }
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0 rounded-xl overflow-hidden">
        <div className="flex w-full h-full">
          <div className="w-full flex flex-col">
            {/* Cabeçalho */}
            <div className="p-6 border-b flex gap-3 bg-card">
              <avatar_1.Avatar className="h-12 w-12">
                <avatar_1.AvatarImage src={(_g = opportunity.company) === null || _g === void 0 ? void 0 : _g.profileImg}/>
                <avatar_1.AvatarFallback>{companyInitials}</avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold">{opportunity.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {(_h = opportunity.company) === null || _h === void 0 ? void 0 : _h.name} • Publicado há{" "}
                  {(0, useGetTimeAgo_1.getTimeAgo)(opportunity.createdAt)}
                </p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {/* Informações básicas */}
              <div className="flex flex-wrap gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <lucide_react_1.MapPin className="h-4 w-4 text-muted-foreground"/>
                  <span>{opportunity.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
                  <span>{opportunityDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
                  <span>{((_j = opportunity.subscribers) === null || _j === void 0 ? void 0 : _j.length) || 0} candidatos</span>
                </div>
              </div>

              {/* Habilidades */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Habilidades necessárias
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(_k = opportunity.skills) === null || _k === void 0 ? void 0 : _k.map(function (skill) { return (<badge_1.Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </badge_1.Badge>); })}
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer com botão de candidatura */}
            <div className="border-t p-6">
              <button_1.Button onClick={handleApply} className="w-full">
                Candidatar-se para esta oportunidade
              </button_1.Button>
            </div>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
