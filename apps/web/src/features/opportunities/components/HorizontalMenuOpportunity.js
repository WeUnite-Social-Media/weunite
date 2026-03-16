"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorizontalMenuOpportunity = HorizontalMenuOpportunity;
var button_1 = require("@/shared/components/ui/button");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var lucide_react_1 = require("lucide-react");
var react_router_dom_1 = require("react-router-dom");
var CreateOpportunity_1 = require("@/features/opportunities/components/CreateOpportunity");
var react_1 = require("react");
function HorizontalMenuOpportunity() {
    var _a = (0, useAuthStore_1.useAuthStore)(), isAuthenticated = _a.isAuthenticated, user = _a.user;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _b = (0, react_1.useState)(false), isCreateOpen = _b[0], setIsCreateOpen = _b[1];
    if (!isAuthenticated)
        return null;
    return (<>
      <div className="flex flex-row w-full h-full z-30 gap-2 pointer-events-auto justify-end pr-1 overflow-x-auto">
        {(user === null || user === void 0 ? void 0 : user.role) === "company" && (<button_1.Button variant="outline" onClick={function () { return navigate("/opportunity/my"); }} className="w-[14em] justify-center text-xs h-[2em] bg-gradient-to-r from-third to-green-500 hover:from-green-500 hover:to-emerald-500 text-white shadow-md hover:shadow-lg transition-all duration-300">
            <lucide_react_1.Building2 className="h-4 w-4 text-white"/>
            <span className="font-medium">Minhas Oportunidades</span>
          </button_1.Button>)}

        <button_1.Button variant="outline" onClick={function () { return navigate("/opportunity/saved"); }} className="w-[14em] justify-center text-xs h-[2em] bg-gradient-to-r from-third to-green-500 hover:from-green-500 hover:to-emerald-500 text-white shadow-md hover:shadow-lg transition-all duration-300">
          <lucide_react_1.Bookmark className="h-4 w-4 text-white"/>
          <span className="font-medium">Oportunidades Salvas</span>
        </button_1.Button>
      </div>

      <CreateOpportunity_1.CreateOpportunity open={isCreateOpen} onOpenChange={setIsCreateOpen}/>
    </>);
}
