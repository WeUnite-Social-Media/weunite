"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateRoutes = PrivateRoutes;
var BottomSideBar_1 = require("@/shared/components/shared/BottomSideBar");
var LeftSidebar_1 = require("@/shared/components/shared/LeftSidebar");
var sidebar_1 = require("@/shared/components/ui/sidebar");
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var useChatStore_1 = require("@/features/chat/stores/useChatStore");
var react_router_dom_1 = require("react-router-dom");
var HeaderMobile_1 = require("@/shared/components/shared/HeaderMobile");
function PrivateRoutes() {
    var isAuthenticated = (0, useAuthStore_1.useAuthStore)().isAuthenticated;
    var maxLeftSideBar = (0, useBreakpoints_1.useBreakpoints)().maxLeftSideBar;
    var isConversationOpen = (0, useChatStore_1.useChatStore)(function (state) { return state.isConversationOpen; });
    if (!isAuthenticated) {
        return <react_router_dom_1.Navigate to={"/auth/login"} replace/>;
    }
    return (<sidebar_1.SidebarProvider>
      <div className="min-h-screen w-full">
        {!maxLeftSideBar && <LeftSidebar_1.LeftSidebar />}
        {maxLeftSideBar && <HeaderMobile_1.HeaderMobile />}

        <main className={"flex-1 ".concat(maxLeftSideBar
            ? isConversationOpen
                ? "h-[calc(100vh-60px)]" // Apenas HeaderMobile (60px)
                : "h-[calc(100vh-116px)]" // HeaderMobile + BottomSideBar
            : "")}>
          <react_router_dom_1.Outlet />
        </main>

        {/* Esconde a BottomSideBar quando uma conversa estiver aberta no mobile */}
        {maxLeftSideBar && !isConversationOpen && <BottomSideBar_1.BottomSideBar />}
      </div>
    </sidebar_1.SidebarProvider>);
}
