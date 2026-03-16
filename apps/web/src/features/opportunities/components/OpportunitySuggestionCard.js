"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CardSuggestionOpportunity;
var card_1 = require("@/shared/components/ui/card");
var react_1 = require("react");
var avatar_1 = require("@/shared/components/ui/avatar");
var getInitials_1 = require("@/shared/utils/getInitials");
var badge_1 = require("@/shared/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var DescriptionOpportunity_1 = require("./DescriptionOpportunity");
function CardSuggestionOpportunity(_a) {
    var _b, _c, _d, _e, _f;
    var opportunity = _a.opportunity;
    var _g = (0, react_1.useState)(false), isDescriptionOpen = _g[0], setIsDescriptionOpen = _g[1];
    var truncateText = function (text, maxLength) {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength) + "...";
    };
    var handleViewMore = function () {
        setIsDescriptionOpen(true);
    };
    var initials = (0, getInitials_1.getInitials)((_b = opportunity.company) === null || _b === void 0 ? void 0 : _b.name);
    return (<>
      <card_1.Card className="w-[18em] h-[15em] flex-shrink-0 flex flex-col cursor-pointer" onClick={handleViewMore}>
        <card_1.CardHeader className="pb-1">
          <div className="flex items-center gap-2 mb-0.5">
            <avatar_1.Avatar className="hover:cursor-pointer h-10 w-10">
              <avatar_1.AvatarImage src={(_c = opportunity.company) === null || _c === void 0 ? void 0 : _c.profileImg} alt="company logo"/>
              <avatar_1.AvatarFallback className="bg-third/10 text-third font-semibold text-xs">
                {initials}
              </avatar_1.AvatarFallback>
            </avatar_1.Avatar>
            <p className="text-xs text-white truncate font-medium">
              {(_d = opportunity.company) === null || _d === void 0 ? void 0 : _d.name}
            </p>
          </div>

          <card_1.CardTitle className="text-sidebar-foreground font-semibold text-sm line-clamp-2">
            {truncateText(opportunity.title, 30)}
          </card_1.CardTitle>
        </card_1.CardHeader>

        <card_1.CardContent className="flex-1 flex flex-col gap-2 pb-3">
          {/* Skills - Duas qualidades */}
          <div className="flex items-center gap-1">
            {(_e = opportunity.skills) === null || _e === void 0 ? void 0 : _e.slice(0, 2).map(function (skill) { return (<badge_1.Badge key={skill.id} variant="secondary" className="text-xs flex-shrink-0">
                {skill.name}
              </badge_1.Badge>); })}
            {opportunity.skills && opportunity.skills.length > 2 && (<span className="text-xs text-muted-foreground ml-1">
                +{opportunity.skills.length - 2}
              </span>)}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <lucide_react_1.MapPin className="h-3.5 w-3.5 flex-shrink-0"/>
            <span className="line-clamp-1">{opportunity.location}</span>
          </div>

          {/* Date and Candidates - Lado a lado padronizado */}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mt-auto pt-2">
            <div className="flex items-center gap-1 flex-1">
              <lucide_react_1.Calendar className="h-3.5 w-3.5 flex-shrink-0"/>
              <span className="truncate">
                {new Date(opportunity.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-1 justify-end">
              <lucide_react_1.Users className="h-3.5 w-3.5 flex-shrink-0"/>
              <span>{((_f = opportunity.subscribers) === null || _f === void 0 ? void 0 : _f.length) || 0}</span>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <DescriptionOpportunity_1.OpportunityDescription isOpen={isDescriptionOpen} onOpenChange={setIsDescriptionOpen} opportunity={opportunity}/>
    </>);
}
