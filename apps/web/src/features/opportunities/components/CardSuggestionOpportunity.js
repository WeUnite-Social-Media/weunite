"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CardSuggestionOpportunity;
var card_1 = require("@/shared/components/ui/card");
var button_1 = require("@/shared/components/ui/button");
var react_1 = require("react");
var OpportunityDetailModal_1 = require("./OpportunityDetailModal");
function CardSuggestionOpportunity(_a) {
    var opportunity = _a.opportunity, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b;
    var _c = (0, react_1.useState)(false), isModalOpen = _c[0], setIsModalOpen = _c[1];
    var truncateText = function (text, maxLength) {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength) + "...";
    };
    var handleViewMore = function () {
        setIsModalOpen(true);
    };
    return (<>
      <card_1.Card className=" shadow-md transition-shadow duration-200 border-none w-full">
        <card_1.CardHeader className="pb-0">
          <card_1.CardTitle className="text-sidebar-foreground font-semibold text-sm sm:text-base line-clamp-2 mb-2">
            {truncateText(opportunity.title, 50)}
          </card_1.CardTitle>
          <card_1.CardDescription className="text-xs sm:text-sm text-sidebar-foreground line-clamp-3">
            {truncateText(opportunity.description, 100)}
          </card_1.CardDescription>
        </card_1.CardHeader>

        <card_1.CardContent className="pt-3">
          <div className="flex justify-end">
            <button_1.Button variant="outline" size="sm" className="text-xs text-third bg-transparent hover:cursor-pointer hover:bg-hover-button" onClick={handleViewMore}>
              Ver Mais
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <OpportunityDetailModal_1.default opportunity={opportunity} isOpen={isModalOpen} onOpenChange={setIsModalOpen} isMobile={isMobile}/>
    </>);
}
