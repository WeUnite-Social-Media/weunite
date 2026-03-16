"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CreateSkill;
var dialog_1 = require("@/shared/components/ui/dialog");
var react_1 = require("react");
var button_1 = require("@/shared/components/ui/button");
var input_1 = require("@/shared/components/ui/input");
var checkbox_1 = require("@/shared/components/ui/checkbox");
var badge_1 = require("@/shared/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/shared/lib/utils");
// Mock de skills que virá do backend futuramente
var MOCK_SKILLS = [
    { id: 1, name: "Lateral Direito" },
    { id: 2, name: "Lateral Esquerdo" },
    { id: 3, name: "Zagueiro Central" },
    { id: 4, name: "Volante" },
    { id: 5, name: "Meio-campo" },
    { id: 6, name: "Meia Atacante" },
    { id: 7, name: "Ponta Direita" },
    { id: 8, name: "Ponta Esquerda" },
    { id: 9, name: "Centroavante" },
    { id: 10, name: "Segundo Atacante" },
    { id: 11, name: "Goleiro" },
    { id: 12, name: "Líbero" },
    { id: 13, name: "Ala Direito" },
    { id: 14, name: "Ala Esquerdo" },
    { id: 15, name: "Fixo" },
    { id: 16, name: "Pivô" },
    { id: 17, name: "Cabeceio" },
    { id: 18, name: "Finalização" },
    { id: 19, name: "Passe Longo" },
    { id: 20, name: "Dribles" },
    { id: 21, name: "Velocidade" },
    { id: 22, name: "Resistência" },
    { id: 23, name: "Agilidade" },
    { id: 24, name: "Força Física" },
    { id: 25, name: "Liderança em Campo" },
    { id: 26, name: "Marcação" },
    { id: 27, name: "Desarme" },
    { id: 28, name: "Cruzamentos" },
    { id: 29, name: "Cobrança de Falta" },
    { id: 30, name: "Cobrança de Pênalti" },
    { id: 31, name: "Jogo Aéreo" },
    { id: 32, name: "Visão de Jogo" },
    { id: 33, name: "Primeiro Toque" },
    { id: 34, name: "Ambidestro" },
    { id: 35, name: "Experiência Internacional" },
];
var SKILLS_PER_PAGE = 10;
function CreateSkill(_a) {
    var selectedSkills = _a.selectedSkills, onSkillsChange = _a.onSkillsChange;
    var _b = (0, react_1.useState)(false), open = _b[0], setOpen = _b[1];
    var _c = (0, react_1.useState)(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = (0, react_1.useState)(1), currentPage = _d[0], setCurrentPage = _d[1];
    var filteredSkills = MOCK_SKILLS.filter(function (skill) {
        return skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    var totalPages = Math.ceil(filteredSkills.length / SKILLS_PER_PAGE);
    var startIndex = (currentPage - 1) * SKILLS_PER_PAGE;
    var endIndex = startIndex + SKILLS_PER_PAGE;
    var currentSkills = filteredSkills.slice(startIndex, endIndex);
    var handleSkillToggle = function (skillName) {
        if (selectedSkills.includes(skillName)) {
            onSkillsChange(selectedSkills.filter(function (s) { return s !== skillName; }));
        }
        else if (selectedSkills.length < 5) {
            onSkillsChange(__spreadArray(__spreadArray([], selectedSkills, true), [skillName], false));
        }
    };
    var handleRemoveSkill = function (skillName) {
        onSkillsChange(selectedSkills.filter(function (s) { return s !== skillName; }));
    };
    var handleCancel = function () {
        setOpen(false);
        setSearchTerm("");
        setCurrentPage(1);
    };
    var handlePageChange = function (page) {
        setCurrentPage(page);
    };
    var canSelectMore = selectedSkills.length < 5;
    return (<dialog_1.Dialog open={open} onOpenChange={setOpen}>
      <dialog_1.DialogTrigger asChild>
        <button_1.Button variant="outline" className="w-full justify-start text-sm font-normal border-none">
          <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
          Adicionar Habilidades
        </button_1.Button>
      </dialog_1.DialogTrigger>

      <dialog_1.DialogContent className="w-[95vw] max-w-[600px] max-h-[80vh] flex flex-col">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Selecionar Habilidades</dialog_1.DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecione até 5 habilidades para esta oportunidade
          </p>
        </dialog_1.DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <input_1.Input placeholder="Buscar habilidades..." value={searchTerm} onChange={function (e) {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
        }} className="pl-10"/>
            <lucide_react_1.X className={(0, utils_1.cn)("absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer", searchTerm ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={function () { return setSearchTerm(""); }}/>
          </div>

          {selectedSkills.length > 0 && (<div className="space-y-2">
              <p className="text-sm font-medium">
                Selecionadas ({selectedSkills.length}/5):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(function (skill) { return (<badge_1.Badge key={skill} variant="default" className="flex items-center h-[2em] gap-1 cursor-pointer hover:bg-primary/90 transition-colors" onClick={function () { return handleRemoveSkill(skill); }}>
                    {skill}
                    <lucide_react_1.X className="h-3 w-3 hover:bg-primary/20 rounded-full" onClick={function (e) {
                    e.stopPropagation();
                    handleRemoveSkill(skill);
                }}/>
                  </badge_1.Badge>); })}
              </div>
            </div>)}

          <div className="flex-1 overflow-auto scrollbar-thumb">
            <div className="space-y-4">
              {currentSkills.map(function (skill) {
            var isSelected = selectedSkills.includes(skill.name);
            var isDisabled = !isSelected && !canSelectMore;
            return (<div key={skill.id} className={(0, utils_1.cn)("flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer", isSelected
                    ? "bg-primary/5 border-primary/20"
                    : "hover:bg-accent", isDisabled && "opacity-50 cursor-not-allowed")} onClick={function () { return !isDisabled && handleSkillToggle(skill.name); }}>
                    <checkbox_1.Checkbox checked={isSelected} disabled={isDisabled} onCheckedChange={function () { return handleSkillToggle(skill.name); }} onClick={function (e) { return e.stopPropagation(); }}/>
                    <span className={(0, utils_1.cn)("flex-1 text-sm", isDisabled && "text-muted-foreground")}>
                      {skill.name}
                    </span>
                  </div>);
        })}
            </div>

            {filteredSkills.length === 0 && (<div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma habilidade encontrada para "{searchTerm}"</p>
              </div>)}
          </div>

          {totalPages > 1 && (<div className="flex items-center justify-center gap-2 pt-2 border-t">
              <button_1.Button variant="outline" size="sm" onClick={function () { return handlePageChange(currentPage - 1); }} disabled={currentPage === 1}>
                Anterior
              </button_1.Button>

              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>

              <button_1.Button variant="outline" size="sm" onClick={function () { return handlePageChange(currentPage + 1); }} disabled={currentPage === totalPages}>
                Próxima
              </button_1.Button>
            </div>)}
        </div>

        <dialog_1.DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <button_1.Button variant="outline" onClick={handleCancel}>
            Cancelar
          </button_1.Button>
          <button_1.Button className="bg-third hover:bg-third-hover" onClick={function () { return setOpen(false); }}>
            Salvar ({selectedSkills.length}/5)
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
