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
exports.HeaderMobile = HeaderMobile;
var drawer_1 = require("@/shared/components/ui/drawer");
var input_1 = require("@/shared/components/ui/input");
var lucide_react_1 = require("lucide-react");
var ThemeProvider_1 = require("@/shared/providers/ThemeProvider");
var useSearchUsers_1 = require("@/features/profile/hooks/useSearchUsers");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var skeleton_1 = require("@/shared/components/ui/skeleton");
var react_avatar_1 = require("@radix-ui/react-avatar");
var getInitials_1 = require("@/shared/utils/getInitials");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
function HeaderMobile() {
    var _a = (0, ThemeProvider_1.useTheme)(), setTheme = _a.setTheme, theme = _a.theme;
    var themeIcon = theme === "dark" ? lucide_react_1.Sun : lucide_react_1.Moon;
    var themeItem = {
        title: "Modo de cor",
        url: "#",
        icon: themeIcon,
    };
    var items = [themeItem];
    var _b = (0, react_1.useState)(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var navigate = (0, react_router_dom_1.useNavigate)();
    var currentUserId = (0, useAuthStore_1.useAuthStore)(function (state) { var _a; return (_a = state.user) === null || _a === void 0 ? void 0 : _a.id; });
    var _c = (0, useSearchUsers_1.useSearchUsers)(searchQuery), users = _c.data, isLoading = _c.isLoading;
    var handleUserClick = function (username) {
        navigate("/profile/".concat(username));
        setSearchQuery("");
    };
    return (<>
      <div className="w-full border-t bg-sidebar z-50">
        <div className="flex justify-between items-center h-15">
          <div className="ml-4">
            <span className="font-bold text-xl ml-2 items-left">
              <span className="text-primary">We</span>
              <span className="text-third">Unite</span>
            </span>
          </div>

          <div className="flex items-center gap-4 mr-6">
            {items.map(function (item) { return (<button key={item.title} onClick={function (e) {
                e.preventDefault();
                if (item.title === "Modo de cor") {
                    setTheme(theme === "dark" ? "light" : "dark");
                }
            }} className="p-2 rounded-full hover:bg-muted transition-colors hover:cursor-pointer" aria-label={item.title}>
                <item.icon size={20} className="text-foreground"/>
              </button>); })}

            <drawer_1.Drawer>
              <drawer_1.DrawerTrigger>
                <lucide_react_1.Search className="h-5 w-5 hover:cursor-pointer"/>
              </drawer_1.DrawerTrigger>
              <drawer_1.DrawerContent className="h-[80vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh]  mt-0 ">
                <drawer_1.DrawerHeader className="pt-8 px-6 relative">
                  <drawer_1.DrawerClose className="absolute rounded-sm transition-opacity right-4 ">
                    <lucide_react_1.X className="h-5 w-5 hover:cursor-pointer"/>
                  </drawer_1.DrawerClose>
                  <drawer_1.DrawerTitle className="mb-4">Pesquisar</drawer_1.DrawerTitle>
                  <div className="relative">
                    <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <input_1.Input placeholder="faça sua pesquisa..." className="pl-10" onChange={function (e) { return setSearchQuery(e.target.value); }}/>
                  </div>
                </drawer_1.DrawerHeader>

                <div className="flex-1 overflow-y-auto p-4">
                  {searchQuery.length === 0 && (<p className="text-sm text-muted-foreground text-center mt-8">
                      Digite para começar a pesquisar...
                    </p>)}

                  {searchQuery.length > 0 && isLoading && (<div className="space-y-3">
                      {__spreadArray([], Array(3), true).map(function (_, i) { return (<div key={i} className="flex items-center space-x-3">
                          <skeleton_1.Skeleton className="h-10 w-10 rounded-full"/>
                          <div className="space-y-1 flex-1">
                            <skeleton_1.Skeleton className="h-4 w-32"/>
                            <skeleton_1.Skeleton className="h-3 w-24"/>
                          </div>
                        </div>); })}
                    </div>)}

                  {searchQuery.length > 0 &&
            !isLoading &&
            users &&
            users.filter(function (user) { return user.id !== String(currentUserId); })
                .length === 0 && (<p className="text-sm text-muted-foreground text-center mt-8">
                        Nenhum usuário encontrado
                      </p>)}

                  {searchQuery.length > 0 &&
            !isLoading &&
            users &&
            users.filter(function (user) { return user.id !== String(currentUserId); })
                .length > 0 && (<div className="space-y-2">
                        {users
                .filter(function (user) { return user.id !== String(currentUserId); })
                .map(function (user) {
                var userName = user.name || "Usuário desconhecido";
                return (<div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer" onClick={function () { return handleUserClick(user.username); }}>
                                <react_avatar_1.Avatar className="h-[2.8em] w-[2.8em]">
                                  <react_avatar_1.AvatarImage src={user.profileImg} alt={userName} className="aspect-square h-full w-full rounded-full object-cover"/>
                                  <react_avatar_1.AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                                    {(0, getInitials_1.getInitials)(userName)}
                                  </react_avatar_1.AvatarFallback>
                                </react_avatar_1.Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {userName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    @{user.username}
                                  </p>
                                </div>
                              </div>);
            })}
                      </div>)}
                </div>
              </drawer_1.DrawerContent>
            </drawer_1.Drawer>
          </div>
        </div>
      </div>
    </>);
}
