"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FeedOpportunity;
var skeleton_1 = require("@/shared/components/ui/skeleton");
var button_1 = require("@/shared/components/ui/button");
var useOpportunities_1 = require("@/features/opportunities/state/useOpportunities");
var OpportunityCard_1 = require("./OpportunityCard");
var HorizontalMenuOpportunity_1 = require("./HorizontalMenuOpportunity");
var OpportunitySearch_1 = require("./OpportunitySearch");
var CreateOpportunity_1 = require("./CreateOpportunity");
var react_1 = require("react");
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
var OpportunitySidebar_1 = require("./OpportunitySidebar");
var lucide_react_1 = require("lucide-react");
var OpportunitySuggestionCarousel_1 = require("./OpportunitySuggestionCarousel");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
function OpportunitySkeleton() {
    return (<div className="w-full max-w-[500px] mb-3 bg-card border rounded-xl p-4">
      <div className="flex items-center space-x-3 mb-4">
        <skeleton_1.Skeleton className="h-12 w-12 rounded-full"/>
        <div className="flex-1">
          <skeleton_1.Skeleton className="h-4 w-32 mb-2"/>
          <skeleton_1.Skeleton className="h-3 w-20"/>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <skeleton_1.Skeleton className="h-6 w-3/4"/>
        <skeleton_1.Skeleton className="h-4 w-full"/>
        <skeleton_1.Skeleton className="h-4 w-2/3"/>
      </div>

      <div className="space-y-2 mb-4">
        <skeleton_1.Skeleton className="h-4 w-1/2"/>
        <skeleton_1.Skeleton className="h-4 w-1/3"/>
      </div>

      <div className="flex gap-2 mb-4">
        <skeleton_1.Skeleton className="h-6 w-16 rounded-full"/>
        <skeleton_1.Skeleton className="h-6 w-20 rounded-full"/>
        <skeleton_1.Skeleton className="h-6 w-18 rounded-full"/>
      </div>

      <div className="flex justify-between border-t pt-4">
        <div className="flex gap-2">
          <skeleton_1.Skeleton className="h-8 w-24 rounded-full"/>
          <skeleton_1.Skeleton className="h-8 w-20 rounded-full"/>
        </div>
        <skeleton_1.Skeleton className="h-8 w-8 rounded"/>
      </div>
    </div>);
}
function FeedOpportunity() {
    var _a = (0, useOpportunities_1.useGetOpportunities)(), data = _a.data, isLoading = _a.isLoading;
    var opportunities = data === null || data === void 0 ? void 0 : data.data;
    var _b = (0, react_1.useState)(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = (0, react_1.useState)(false), isCreateOpportunityOpen = _c[0], setIsCreateOpportunityOpen = _c[1];
    var _d = (0, useBreakpoints_1.useBreakpoints)(), isMobile = _d.isMobile, isTablet = _d.isTablet, isDesktop = _d.isDesktop;
    var user = (0, useAuthStore_1.useAuthStore)().user;
    if (isLoading) {
        return (<div className="flex justify-center w-full">
        {!isMobile && !isTablet && <OpportunitySidebar_1.OpportunitySidebar />}
        <div className="max-w-[600px] w-full flex flex-col items-center">
          {Array.from({ length: 3 }).map(function (_, index) { return (<OpportunitySkeleton key={index}/>); })}
        </div>
      </div>);
    }
    if (!opportunities || opportunities.length === 0) {
        return (<>
        <div className="flex justify-center w-full pt-4">
          <div className="max-w-[600px] w-full flex flex-col items-center gap-2">
            <div className="w-full flex flex-col justify-between items-start gap-4">
              <OpportunitySearch_1.default searchTerm={searchTerm} onSearchChange={setSearchTerm}/>
              <OpportunitySidebar_1.OpportunitySidebar />
            </div>

            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="text-center space-y-3">
                <div className="text-4xl mb-4">🏢</div>
                <p className="text-muted-foreground text-lg font-medium">
                  Nenhuma oportunidade disponível
                </p>
                <p className="text-sm text-muted-foreground">
                  Seja o primeiro a criar uma oportunidade!
                </p>
              </div>
            </div>
          </div>
        </div>

        {!isDesktop && (user === null || user === void 0 ? void 0 : user.role) === "company" && (<button_1.Button onClick={function () { return setIsCreateOpportunityOpen(true); }} className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-[60]" size="icon">
            <lucide_react_1.Plus className="h-6 w-6"/>
          </button_1.Button>)}

        <CreateOpportunity_1.CreateOpportunity open={isCreateOpportunityOpen} onOpenChange={setIsCreateOpportunityOpen}/>
      </>);
    }
    return (<>
      <div className="flex justify-center w-full pt-4">
        <div className="max-w-[45em] w-full flex flex-col items-center gap-2">
          <div className="w-full flex flex-col gap-2 items-end">
            <OpportunitySearch_1.default searchTerm={searchTerm} onSearchChange={setSearchTerm}/>

            {isDesktop ? <OpportunitySidebar_1.OpportunitySidebar /> : <HorizontalMenuOpportunity_1.HorizontalMenuOpportunity />}
          </div>
          {opportunities && opportunities.length > 0 && (<OpportunitySuggestionCarousel_1.default opportunities={opportunities}/>)}
          {opportunities.map(function (opportunity) { return (<OpportunityCard_1.default key={opportunity.id} opportunity={opportunity}/>); })}
        </div>
      </div>

      {!isDesktop && (<button_1.Button onClick={function () { return setIsCreateOpportunityOpen(true); }} className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-[10]" size="icon">
          <lucide_react_1.Plus className="h-6 w-6"/>
        </button_1.Button>)}

      <CreateOpportunity_1.CreateOpportunity open={isCreateOpportunityOpen} onOpenChange={setIsCreateOpportunityOpen}/>
    </>);
}
