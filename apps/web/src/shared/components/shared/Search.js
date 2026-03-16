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
exports.Search = Search;
var input_1 = require("@/shared/components/ui/input");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var react_router_dom_1 = require("react-router-dom");
var useSearchUsers_1 = require("@/features/profile/hooks/useSearchUsers");
var react_avatar_1 = require("@radix-ui/react-avatar");
var skeleton_1 = require("@/shared/components/ui/skeleton");
var getInitials_1 = require("@/shared/utils/getInitials");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
function Search(_a) {
    var _b = _a.isOpen, isOpen = _b === void 0 ? false : _b, onOpenChange = _a.onOpenChange;
    var _c = (0, react_1.useState)(isOpen), open = _c[0], setOpen = _c[1];
    var _d = (0, react_1.useState)(false), isAnimating = _d[0], setIsAnimating = _d[1];
    var _e = (0, react_1.useState)(isOpen), shouldRender = _e[0], setShouldRender = _e[1];
    var _f = (0, react_1.useState)(""), searchQuery = _f[0], setSearchQuery = _f[1];
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _g = (0, useSearchUsers_1.useSearchUsers)(searchQuery), users = _g.data, isLoading = _g.isLoading, error = _g.error;
    var currentUserId = (0, useAuthStore_1.useAuthStore)(function (state) { var _a; return (_a = state.user) === null || _a === void 0 ? void 0 : _a.id; });
    var handleUserClick = function (username) {
        navigate("/profile/".concat(username));
        handleOpenChange(false);
        setSearchQuery("");
    };
    (0, react_1.useEffect)(function () {
        if (onOpenChange) {
            setOpen(isOpen);
        }
        if (isOpen || (!onOpenChange && open)) {
            setShouldRender(true);
            setIsAnimating(false);
        }
        else {
            setIsAnimating(true);
            var timer_1 = setTimeout(function () {
                setShouldRender(false);
            }, 500);
            return function () { return clearTimeout(timer_1); };
        }
    }, [isOpen, onOpenChange, open]);
    var handleOpenChange = function (newOpen) {
        setOpen(newOpen);
        onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(newOpen);
    };
    var isCurrentlyOpen = onOpenChange ? isOpen : open;
    if (!shouldRender)
        return null;
    return (<>
      <div className={"fixed top-0 bottom-0 z-40 pointer-events-auto bg-card border-r border-border shadow-lg ".concat(isAnimating
            ? "animate-out slide-out-to-left"
            : "animate-in slide-in-from-left", " duration-500")} style={{
            left: "5rem",
            width: "320px",
        }} onAnimationEnd={function () {
            if (isAnimating && !isCurrentlyOpen) {
                setShouldRender(false);
            }
        }}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pesquisar</h2>
            <button onClick={function () { return handleOpenChange(false); }} className="p-1 rounded-full hover:bg-muted transition-colors" aria-label="Fechar pesquisa">
              <lucide_react_1.X className="h-5 w-5 hover:cursor-pointer"/>
            </button>
          </div>
          <input_1.Input placeholder="Pesquisa por..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
          <div className="mb-4"></div>

          <div className="flex-1 overflow-y-auto">
            {searchQuery.length === 0 && (<p className="text-sm text-muted-foreground">
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

            {searchQuery.length > 0 && !isLoading && error && (<p className="text-sm text-red-500">
                Erro ao buscar usuários. Tente novamente.
              </p>)}

            {searchQuery.length > 0 &&
            !isLoading &&
            users &&
            Array.isArray(users) &&
            users.filter(function (user) { return user.id !== String(currentUserId); })
                .length === 0 && (<p className="text-sm text-muted-foreground">
                  Nenhum usuário encontrado para "{searchQuery}"
                </p>)}

            {searchQuery.length > 0 &&
            !isLoading &&
            users &&
            Array.isArray(users) &&
            users.filter(function (user) { return user.id !== String(currentUserId); }).length >
                0 && (<div className="space-y-2">
                  {users
                .filter(function (user) { return user.id !== String(currentUserId); })
                .map(function (user) {
                var userName = user.name || "Usuário desconhecido";
                return (<div key={user.id} className="flex items-center justify-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors" onClick={function () { return handleUserClick(user.username); }}>
                          <react_avatar_1.Avatar className="h-[2.8em] w-[2.8em]">
                            <react_avatar_1.AvatarImage src={user.profileImg} alt={userName} className="aspect-square h-full w-full rounded-full object-cover"/>
                            <react_avatar_1.AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                              {(0, getInitials_1.getInitials)(userName)}
                            </react_avatar_1.AvatarFallback>
                          </react_avatar_1.Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {userName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              @{user.username}
                            </p>
                          </div>
                        </div>);
            })}
                </div>)}
          </div>
        </div>
      </div>
    </>);
}
