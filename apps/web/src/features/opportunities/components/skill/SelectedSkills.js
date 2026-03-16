"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectedSkills = SelectedSkills;
var badge_1 = require("@/shared/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/shared/lib/utils");
function SelectedSkills(_a) {
    var skills = _a.skills, onRemoveSkill = _a.onRemoveSkill, className = _a.className, _b = _a.showRemove, showRemove = _b === void 0 ? false : _b;
    if (skills.length === 0) {
        return (<div className={(0, utils_1.cn)("text-sm text-muted-foreground py-2", className)}>
        Nenhuma habilidade selecionada
      </div>);
    }
    return (<div className={(0, utils_1.cn)("flex flex-wrap gap-2", className)}>
      {skills.map(function (skill) { return (<badge_1.Badge key={skill} variant="secondary" className={(0, utils_1.cn)("flex items-center gap-1", onRemoveSkill &&
                "cursor-pointer h-[3em] hover:bg-secondary/80 transition-colors")} onClick={function () { return onRemoveSkill && onRemoveSkill(skill); }}>
          {skill}
          {showRemove && onRemoveSkill && (<lucide_react_1.X className="h-3 w-3 cursor-pointer hover:bg-secondary/60 rounded-full" onClick={function (e) {
                    e.stopPropagation();
                    onRemoveSkill(skill);
                }}/>)}
        </badge_1.Badge>); })}
    </div>);
}
