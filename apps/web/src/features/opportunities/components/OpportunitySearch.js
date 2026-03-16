"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OpportunitySearch;
var input_1 = require("@/shared/components/ui/input");
var lucide_react_1 = require("lucide-react");
function OpportunitySearch(_a) {
    var searchTerm = _a.searchTerm, onSearchChange = _a.onSearchChange;
    return (<div className="w-[96vw] max-w-[45em] ml-2 md:ml-0">
      <div className="relative">
        <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
        <input_1.Input placeholder="Buscar oportunidades..." value={searchTerm} onChange={function (e) { return onSearchChange(e.target.value); }} className="pl-10 h-[5vh] w-full bg-card border-border focus:border-third focus:ring-1 focus:ring-third/20"/>
      </div>
    </div>);
}
