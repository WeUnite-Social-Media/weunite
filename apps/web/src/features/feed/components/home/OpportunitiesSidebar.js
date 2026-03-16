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
exports.OpportunitiesSidebar = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/shared/components/ui/button");
var skeleton_1 = require("@/shared/components/ui/skeleton");
var sheet_1 = require("@/shared/components/ui/sheet");
var CardSuggestionOpportunity_1 = require("@/features/opportunities/components/CardSuggestionOpportunity");
var useOpportunities_1 = require("@/features/opportunities/state/useOpportunities");
var useCustomBreakpoint = function (breakpoint) {
    if (breakpoint === void 0) { breakpoint = 1500; }
    var _a = (0, react_1.useState)(false), isDesktop = _a[0], setIsDesktop = _a[1];
    (0, react_1.useEffect)(function () {
        var checkScreenSize = function () {
            setIsDesktop(window.innerWidth >= breakpoint);
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return function () { return window.removeEventListener("resize", checkScreenSize); };
    }, [breakpoint]);
    return isDesktop;
};
var OpportunitiesSidebar = function () {
    var _a = (0, react_1.useState)(false), showAll = _a[0], setShowAll = _a[1];
    var _b = (0, react_1.useState)(1), visibleOpportunities = _b[0], setVisibleOpportunities = _b[1];
    var _c = (0, react_1.useState)(false), isSheetOpen = _c[0], setIsSheetOpen = _c[1];
    var _d = (0, react_1.useState)([]), randomizedOpportunities = _d[0], setRandomizedOpportunities = _d[1];
    var _e = (0, react_1.useState)(4), displayCount = _e[0], setDisplayCount = _e[1];
    var isDesktop = useCustomBreakpoint(1500);
    var _f = (0, useOpportunities_1.useGetOpportunities)(), opportunitiesData = _f.data, isLoading = _f.isLoading;
    var allOpportunities = Array.isArray(opportunitiesData === null || opportunitiesData === void 0 ? void 0 : opportunitiesData.data)
        ? opportunitiesData.data
        : [];
    (0, react_1.useEffect)(function () {
        if (!(opportunitiesData === null || opportunitiesData === void 0 ? void 0 : opportunitiesData.success) || !opportunitiesData.data) {
            return;
        }
        var opportunities = Array.isArray(opportunitiesData.data)
            ? opportunitiesData.data
            : [];
        setRandomizedOpportunities(function (current) {
            if (current.length > 0 &&
                Math.abs(opportunities.length - current.length) <= 2) {
                return current;
            }
            return __spreadArray([], opportunities, true).sort(function () { return Math.random() - 0.5; });
        });
    }, [opportunitiesData]);
    var randomOpportunities = randomizedOpportunities.slice(0, displayCount);
    var hasMoreOpportunities = displayCount < randomizedOpportunities.length;
    var handleShowMore = function () {
        if (!showAll) {
            setShowAll(true);
            setVisibleOpportunities(randomOpportunities.length);
            return;
        }
        setDisplayCount(function (previous) {
            return Math.min(previous + 4, randomizedOpportunities.length);
        });
    };
    var handleClose = function () {
        setShowAll(false);
        setVisibleOpportunities(1);
        setDisplayCount(4);
    };
    var displayedOpportunities = randomOpportunities.slice(0, visibleOpportunities);
    var opportunitiesContent = (<>
      {showAll && (<div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Mostrando {displayedOpportunities.length} de{" "}
            {randomizedOpportunities.length}
          </span>
          <button onClick={handleClose} className="bg-transparent text-sm font-medium text-third hover:cursor-pointer hover:bg-transparent">
            Fechar
          </button>
        </div>)}

      <div className="space-y-4 justify-end">
        {isLoading ? (Array.from({ length: visibleOpportunities }).map(function (_, index) { return (<div key={index} className="space-y-3">
              <skeleton_1.Skeleton className="h-32 w-full rounded-lg"/>
            </div>); })) : displayedOpportunities.length > 0 ? (displayedOpportunities.map(function (opportunity) { return (<CardSuggestionOpportunity_1.default key={opportunity.id} opportunity={opportunity}/>); })) : (<div className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma oportunidade disponivel no momento
          </div>)}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {!showAll && randomOpportunities.length > 1 && (<div className="flex justify-end">
            <button onClick={handleShowMore} className="rounded bg-transparent px-2 py-1 text-sm font-medium text-third duration-200 hover:cursor-pointer hover:bg-hover-button">
              Ver Outras
            </button>
          </div>)}

        {showAll && hasMoreOpportunities && (<button onClick={handleShowMore} className="w-full rounded border border-third/20 bg-transparent px-4 py-2 text-sm font-medium text-third duration-200 hover:cursor-pointer hover:bg-hover-button">
            Mostrar Mais Oportunidades
          </button>)}

        {showAll && !hasMoreOpportunities && allOpportunities.length > 0 && (<p className="py-2 text-center text-xs text-muted-foreground">
            Todas as oportunidades foram carregadas
          </p>)}
      </div>
    </>);
    return (<>
      {isDesktop && (<div className="pointer-events-none fixed right-0 top-0 z-30 h-screen w-[20vw] bg-background mr-6">
          <div className="mb-2 mt-6 flex items-center justify-center">
            <h2 className="ml-2 text-lg font-semibold text-sidebar-foreground">
              Sugestoes de oportunidade
            </h2>
          </div>
          <div className="pointer-events-auto h-full flex-1 overflow-y-auto">
            {opportunitiesContent}
          </div>
        </div>)}

      {!isDesktop && (<div>
          <sheet_1.Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <sheet_1.SheetTrigger asChild>
              <button_1.Button size="icon" className="pointer-events-auto fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-primary shadow-lg hover:cursor-pointer hover:bg-primary/90" aria-label="Abrir sugestoes de oportunidade">
                <lucide_react_1.Lightbulb className="h-6 w-6"/>
              </button_1.Button>
            </sheet_1.SheetTrigger>

            <sheet_1.SheetContent side="right" className="w-[70vw] max-w-[800px] sm:w-[700px]">
              <sheet_1.SheetHeader className="mb-6">
                <sheet_1.SheetTitle>Sugestoes de oportunidade</sheet_1.SheetTitle>
                <sheet_1.SheetDescription>
                  Descubra novas oportunidades que podem interessar voce
                </sheet_1.SheetDescription>
              </sheet_1.SheetHeader>

              <div className="h-[calc(100vh-8rem)] overflow-y-auto px-4" style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
            }}>
                <style>{"\n                  div::-webkit-scrollbar {\n                    display: none;\n                  }\n                "}</style>
                <div className="mx-auto max-w-sm space-y-4">
                  {opportunitiesContent}
                </div>
              </div>
            </sheet_1.SheetContent>
          </sheet_1.Sheet>
        </div>)}
    </>);
};
exports.OpportunitiesSidebar = OpportunitiesSidebar;
