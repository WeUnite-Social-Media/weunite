"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Followers;
var drawer_1 = require("@/shared/components/ui/drawer");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/shared/components/ui/input");
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
var dialog_1 = require("@/shared/components/ui/dialog");
var CardFollowing_1 = require("./CardFollowing");
var useFollow_1 = require("@/features/profile/state/useFollow");
function Followers(_a) {
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, userId = _a.userId;
    var _b = (0, useBreakpoints_1.useBreakpoints)(), isDesktop = _b.isDesktop, isTablet = _b.isTablet;
    var _c = (0, useFollow_1.useGetFollowers)(userId), followersData = _c.data, error = _c.error;
    var handleClose = function () {
        if (onOpenChange)
            onOpenChange(false);
    };
    var renderFollowersList = function () {
        var _a;
        if (error) {
            return <p>Erro ao carregar seguidores.</p>;
        }
        if (!(followersData === null || followersData === void 0 ? void 0 : followersData.success)) {
            return <p>Erro ao buscar seguidores.</p>;
        }
        var followers = (_a = followersData === null || followersData === void 0 ? void 0 : followersData.data) === null || _a === void 0 ? void 0 : _a.data;
        if (!followers || !Array.isArray(followers) || followers.length === 0) {
            return <p>Nenhum seguidor encontrado.</p>;
        }
        return followers.map(function (follower) { return (<CardFollowing_1.default key={follower.id} user={follower.follower} onUserClick={handleClose}/>); });
    };
    if (!isDesktop && isTablet) {
        return (<drawer_1.Drawer open={isOpen} onOpenChange={onOpenChange}>
        <drawer_1.DrawerContent className="h-[100vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh] mt-0">
          <drawer_1.DrawerHeader className="pt-8 px-6 relative">
            <drawer_1.DrawerClose className="absolute rounded-sm transition-opacity right-4">
              <lucide_react_1.X className="h-5 w-5 hover:cursor-pointer"/>
            </drawer_1.DrawerClose>
            <drawer_1.DrawerTitle className="mb-4">Seguidores</drawer_1.DrawerTitle>
            <div className="relative">
              <input_1.Input placeholder="Pesquisar..."/>
            </div>
          </drawer_1.DrawerHeader>
          <div className="flex flex-col flex-1 overflow-y-auto" style={{
                scrollbarWidth: "thin",
                scrollbarColor: "transparent transparent",
            }} onMouseEnter={function (e) {
                e.currentTarget.style.scrollbarColor =
                    "rgba(0,0,0,0.3) transparent";
            }} onMouseLeave={function (e) {
                e.currentTarget.style.scrollbarColor = "transparent transparent";
            }}>
            {renderFollowersList()}
          </div>
        </drawer_1.DrawerContent>
      </drawer_1.Drawer>);
    }
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="h-[80vh] w-[70vw] xl:max-w-[50vw] flex flex-col">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Seguidores</dialog_1.DialogTitle>
          <dialog_1.DialogClose />
          <div className="relative">
            <input_1.Input placeholder="Pesquisar..."/>
          </div>
        </dialog_1.DialogHeader>
        <div className="flex flex-col flex-1 overflow-y-auto" style={{
            scrollbarWidth: "thin",
            scrollbarColor: "transparent transparent",
        }} onMouseEnter={function (e) {
            e.currentTarget.style.scrollbarColor =
                "rgba(0,0,0,0.3) transparent";
        }} onMouseLeave={function (e) {
            e.currentTarget.style.scrollbarColor = "transparent transparent";
        }}>
          {renderFollowersList()}
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
