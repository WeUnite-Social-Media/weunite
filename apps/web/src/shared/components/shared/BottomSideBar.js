"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottomSideBar = BottomSideBar;
var react_router_dom_1 = require("react-router-dom");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var avatar_1 = require("@/shared/components/ui/avatar");
var CreatePost_1 = require("@/features/feed/components/post/CreatePost");
var dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
function BottomSideBar() {
    var _a = (0, react_1.useState)(false), isCreatePostOpen = _a[0], setIsCreatePostOpen = _a[1];
    var _b = (0, useAuthStore_1.useAuthStore)(), logout = _b.logout, user = _b.user;
    var location = (0, react_router_dom_1.useLocation)();
    var navigate = (0, react_router_dom_1.useNavigate)();
    var pathname = location.pathname;
    var getIncoColor = function (path) {
        return pathname === path ? "#22C55E" : "currentColor";
    };
    var handleLogout = function () {
        logout();
        navigate("/auth/login");
    };
    var handleCreatePostOpen = function () {
        setIsCreatePostOpen(true);
    };
    var items = [
        { title: "Home", url: "/home", icon: lucide_react_1.Home, color: getIncoColor("/home") },
        {
            title: "Oportunidade",
            url: "/opportunity",
            icon: lucide_react_1.Link,
            color: getIncoColor("/opportunity"),
        },
        { title: "Criar Publicação", url: "#", icon: lucide_react_1.DiamondPlus },
        { title: "Chat", url: "/chat", icon: lucide_react_1.MessageCircleMore },
    ];
    return (<>
      <CreatePost_1.CreatePost open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}/>

      <div className="fixed bottom-0 w-screen border-t bg-sidebar z-50 ">
        <div className="flex justify-around items-center h-14">
          {items.map(function (item) { return (<button key={item.title} onClick={function (e) {
                e.preventDefault();
                if (item.title === "Criar Publicação") {
                    handleCreatePostOpen();
                }
                else if (item.url !== "#") {
                    navigate(item.url);
                }
            }} className="flex flex-col items-center justify-center w-full py-2 relative" aria-label={item.title}>
              <item.icon size={24} color={item.url !== "#" && pathname === item.url
                ? "#22C55E"
                : "currentColor"} className="hover:cursor-pointer"/>
              {item.url !== "#" && pathname === item.url && (<span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#22C55E] rounded-full"/>)}
            </button>); })}

          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center justify-center w-full py-2" aria-label="Perfil">
                <avatar_1.Avatar className="h-7 w-7 hover:cursor-pointer">
                  <avatar_1.AvatarImage src={user === null || user === void 0 ? void 0 : user.profileImg}/>
                  <avatar_1.AvatarFallback>
                    <lucide_react_1.User size={20}/>
                  </avatar_1.AvatarFallback>
                </avatar_1.Avatar>
              </button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end" className="w-48">
              <dropdown_menu_1.DropdownMenuItem onClick={function () { return navigate("/profile"); }} className="cursor-pointer text-third">
                Perfil
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                Sair
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </div>
      </div>
    </>);
}
