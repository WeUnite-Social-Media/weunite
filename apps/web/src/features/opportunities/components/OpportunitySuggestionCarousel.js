"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OpportunitySuggestionCarousel;
var OpportunitySuggestionCard_1 = require("./OpportunitySuggestionCard");
function OpportunitySuggestionCarousel(_a) {
    var opportunities = _a.opportunities;
    return (<div className="bg-background pb-4  pt-4 pl-1 rounded-lg w-full">
      <h2>Oportunidades Sugestões</h2>
      <div className="flex flex-row gap-3 overflow-x-auto mt-4" style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
        }}>
        {opportunities.map(function (opportunity) { return (<OpportunitySuggestionCard_1.default key={opportunity.id} opportunity={opportunity}/>); })}
      </div>
      <style>{"\n        div::-webkit-scrollbar {\n          display: none;\n        }\n      "}</style>
    </div>);
}
