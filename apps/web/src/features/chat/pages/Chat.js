"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = Chat;
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
var ChatLayout_1 = require("@/features/chat/components/ChatLayout");
var sidebar_1 = require("@/shared/components/ui/sidebar");
function Chat() {
    var maxLeftSideBar = (0, useBreakpoints_1.useBreakpoints)().maxLeftSideBar;
    var state = (0, sidebar_1.useSidebar)().state;
    // Para desktop: calcula largura e posição baseado no estado da sidebar
    var getDesktopLayout = function () {
        if (state === "collapsed") {
            // Sidebar fechada: mais perto dela com espaçamento (sidebar tem ~4rem quando fechada)
            return "w-[calc(100vw-6.5rem)] h-screen p-4 ml-[6.5rem]";
        }
        else {
            // Sidebar aberta: ajusta para não sobrepor com espaçamento (sidebar tem ~16rem quando aberta)
            return "w-[calc(100vw-18.5rem)] h-screen p-4 ml-[18.5rem]";
        }
    };
    return (<div className={"".concat(maxLeftSideBar
            ? "w-full h-full" // Mobile/Tablet: altura completa
            : getDesktopLayout() // Desktop: layout dinâmico baseado na sidebar
        , " ").concat(!maxLeftSideBar ? "transition-all duration-300 ease-in-out" : "")}>
      <ChatLayout_1.ChatLayout />
    </div>);
}
