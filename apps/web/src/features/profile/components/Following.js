"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Following;
var drawer_1 = require("@/shared/components/ui/drawer");
var dialog_1 = require("@/shared/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/shared/components/ui/input");
var CardFollowing_1 = require("./CardFollowing");
var react_1 = require("react");
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
var useFollow_1 = require("@/features/profile/state/useFollow");
function Following(_a) {
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, userId = _a.userId;
    var _b = (0, useBreakpoints_1.useBreakpoints)(), isDesktop = _b.isDesktop, isTablet = _b.isTablet;
    var _c = (0, useFollow_1.useGetFollowing)(userId), followingData = _c.data, error = _c.error;
    var handleClose = (0, react_1.useCallback)(function () {
        if (onOpenChange)
            onOpenChange(false);
    }, [onOpenChange]);
    var renderFollowingList = function () {
        var _a;
        if (error) {
            return <p>Erro ao carregar usuários seguidos.</p>;
        }
        if (!(followingData === null || followingData === void 0 ? void 0 : followingData.success)) {
            return <p>Erro ao buscar usuários seguidos.</p>;
        }
        var following = (_a = followingData === null || followingData === void 0 ? void 0 : followingData.data) === null || _a === void 0 ? void 0 : _a.data;
        if (!following || !Array.isArray(following) || following.length === 0) {
            return <p>Você não está seguindo ninguém.</p>;
        }
        return following.map(function (followingItem) { return (<CardFollowing_1.default key={followingItem.id} user={followingItem.followed} onUserClick={handleClose}/>); });
    };
    if (!isDesktop && isTablet) {
        return (<drawer_1.Drawer open={isOpen} onOpenChange={onOpenChange}>
        <drawer_1.DrawerContent className="h-[100vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh] mt-0">
          <drawer_1.DrawerHeader className="pt-8 px-6 relative">
            <drawer_1.DrawerClose className="absolute rounded-sm transition-opacity right-4">
              <lucide_react_1.X className="h-5 w-5 hover:cursor-pointer"/>
            </drawer_1.DrawerClose>
            <drawer_1.DrawerTitle className="mb-4">Seguindo</drawer_1.DrawerTitle>
            <div className="relative">
              <input_1.Input placeholder="Pesquisar..."/>
            </div>
          </drawer_1.DrawerHeader>
          <div className="flex flex-col overflow-y-auto px-2 pt-2" style={{
                scrollbarWidth: "thin",
                scrollbarColor: "transparent transparent",
            }} onMouseEnter={function (e) {
                e.currentTarget.style.scrollbarColor =
                    "rgba(0,0,0,0.3) transparent";
            }} onMouseLeave={function (e) {
                e.currentTarget.style.scrollbarColor = "transparent transparent";
            }}>
            {renderFollowingList()}
          </div>
        </drawer_1.DrawerContent>
      </drawer_1.Drawer>);
    }
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="h-[80vh] w-[70vw] xl:max-w-[50vw] flex flex-col">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Seguindo</dialog_1.DialogTitle>
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
          {renderFollowingList()}
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
