"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeftSidebar = LeftSidebar;
var lucide_react_1 = require("lucide-react");
var sidebar_1 = require("@/shared/components/ui/sidebar");
var dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
var avatar_1 = require("@/shared/components/ui/avatar");
var sidebar_2 = require("@/shared/components/ui/sidebar");
var Search_1 = require("@/shared/components/shared/Search");
var CreatePost_1 = require("@/features/feed/components/post/CreatePost");
var ThemeProvider_1 = require("@/shared/providers/ThemeProvider");
var react_router_dom_1 = require("react-router-dom");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var react_router_dom_2 = require("react-router-dom");
var react_1 = require("react");
var react_2 = require("react");
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
var getInitials_1 = require("@/shared/utils/getInitials");
function LeftSidebar() {
    var _a = (0, sidebar_2.useSidebar)(), state = _a.state, setOpen = _a.setOpen;
    var _b = (0, react_1.useState)(false), isSearchOpen = _b[0], setIsSearchOpen = _b[1];
    var _c = (0, react_1.useState)(false), isCreatePostOpen = _c[0], setIsCreatePostOpen = _c[1];
    var logout = (0, useAuthStore_1.useAuthStore)().logout;
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var initials = (0, getInitials_1.getInitials)(user === null || user === void 0 ? void 0 : user.username);
    // Lista temporária de emails de administradores
    var ADMIN_EMAILS = [
        "admin@weunite.com",
        "luiz@weunite.com",
        "matheus@weunite.com",
        "matheusoliveirale2007@gmail.com",
        "manoel_jonathan@hotmail.com",
    ];
    // Verifica se o usuário é administrador
    var isAdmin = (user === null || user === void 0 ? void 0 : user.isAdmin) || ((user === null || user === void 0 ? void 0 : user.email) && ADMIN_EMAILS.includes(user.email));
    var _d = (0, ThemeProvider_1.useTheme)(), setTheme = _d.setTheme, theme = _d.theme;
    var themeIcon = theme === "dark" ? lucide_react_1.Sun : lucide_react_1.Moon;
    var location = (0, react_router_dom_1.useLocation)();
    var pathname = location.pathname;
    var getIncoColor = function (path) {
        return pathname === path ? "#22C55E" : "currentColor";
    };
    var navigate = (0, react_router_dom_2.useNavigate)();
    var _e = (0, useBreakpoints_1.useBreakpoints)(), isMobile = _e.isMobile, isSmallDesktop = _e.isSmallDesktop;
    var previsDesktop = (0, react_1.useRef)(isSmallDesktop);
    var handleSearchOpen = function () {
        if (state === "expanded") {
            setOpen(false);
        }
        setIsSearchOpen(true);
    };
    var handleCreatePostOpen = function () {
        setIsCreatePostOpen(true);
    };
    var handleLogout = function () {
        logout();
        navigate("/auth/login");
    };
    var themeItem = {
        title: "Modo de cor",
        url: "#",
        icon: themeIcon,
    };
    var items = [
        { title: "Home", url: "/home", icon: lucide_react_1.Home, color: getIncoColor("/home") },
        {
            title: "Oportunidade",
            url: "/opportunity",
            icon: lucide_react_1.Link,
            color: getIncoColor("/opportunity"),
        },
        {
            title: "Chat",
            url: "/chat",
            icon: lucide_react_1.MessageCircleMore,
            color: getIncoColor("/chat"),
        },
        { title: "Pesquisar", url: "#", icon: lucide_react_1.Search },
        { title: "Criar Publicação", url: "#", icon: lucide_react_1.DiamondPlus },
        themeItem,
    ];
    (0, react_2.useEffect)(function () {
        if (isSearchOpen && state === "expanded") {
            setOpen(false);
        }
    }, [isSearchOpen, state, setOpen]);
    (0, react_2.useEffect)(function () {
        if (isSmallDesktop && !previsDesktop.current) {
            setOpen(false);
        }
        previsDesktop.current = isSmallDesktop;
    }, [isSmallDesktop, setOpen]);
    var CustomSidebarTrigger = function (props) {
        var handleClick = function (e) {
            var _a;
            if (isSearchOpen && state === "collapsed") {
                return;
            }
            (_a = props.onClick) === null || _a === void 0 ? void 0 : _a.call(props, e);
        };
        return <sidebar_1.SidebarTrigger {...props} onClick={handleClick}/>;
    };
    return (<>
      <Search_1.Search isOpen={isSearchOpen} onOpenChange={setIsSearchOpen}/>
      <CreatePost_1.CreatePost open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}/>

      <sidebar_1.Sidebar collapsible="icon">
        <sidebar_1.SidebarHeader>
          <div className={"\n              ".concat(state === "collapsed" ? "flex justify-center items-center" : "pt-4", "\n              ")}>
            {state === "collapsed" || isMobile ? (<div className="flex items-center justify-center w-full py-4">
                <span className="font-bold text-xl text-primary">W</span>
                <CustomSidebarTrigger className="p-0 m-0"/>
              </div>) : (<div className="flex items-center justify-between">
                <span className={"\n                        font-bold transition-all duration-200  whitespace-nowrap max-w-xs opacity-100 text-xl ml-2 \n                      "} style={{
                transition: "all 0.2s",
            }}>
                  <span className="text-primary ">We</span>
                  <span className="text-third">Unite</span>
                </span>
                <CustomSidebarTrigger />
              </div>)}
          </div>
        </sidebar_1.SidebarHeader>
        <sidebar_1.SidebarContent>
          <sidebar_1.SidebarGroup>
            <sidebar_1.SidebarGroupLabel className={state === "collapsed" ? "text-center" : ""}>
              {state !== "collapsed" && !isMobile && "Navegação"}
            </sidebar_1.SidebarGroupLabel>
            <sidebar_1.SidebarGroupContent>
              <sidebar_1.SidebarMenu className={state === "collapsed" || isMobile
            ? "flex flex-col items-center gap-6"
            : "gap-4"}>
                {items.map(function (item) { return (<sidebar_1.SidebarMenuItem key={item.title} className={state === "collapsed"
                ? "w-full flex justify-center mb-2"
                : "mb-2"}>
                    <sidebar_1.SidebarMenuButton tooltip={state === "collapsed" ? item.title : undefined} onClick={function (e) {
                e.preventDefault();
                if (item.title === "Modo de cor") {
                    setTheme(theme === "dark" ? "light" : "dark");
                }
                else if (item.title === "Pesquisar") {
                    handleSearchOpen();
                }
                else if (item.title === "Criar Publicação") {
                    handleCreatePostOpen();
                }
                else if (item.url !== "#") {
                    navigate(item.url);
                }
            }} className={"flex cursor-pointer ".concat(state === "collapsed"
                ? "justify-center w-full py-2"
                : "items-center gap-2")}>
                      <div className={state === "collapsed" ? "flex justify-center" : ""}>
                        <item.icon style={{
                width: "24px",
                height: "24px",
                color: item.url !== "#" && pathname === item.url
                    ? "#22C55E"
                    : "currentColor",
            }}/>
                      </div>
                      {state !== "collapsed" && (<span className={item.url !== "#" && pathname === item.url
                    ? "text-[#22C55E]"
                    : ""}>
                          {item.title}
                        </span>)}
                    </sidebar_1.SidebarMenuButton>
                  </sidebar_1.SidebarMenuItem>); })}
              </sidebar_1.SidebarMenu>
            </sidebar_1.SidebarGroupContent>
          </sidebar_1.SidebarGroup>
        </sidebar_1.SidebarContent>
        <sidebar_1.SidebarFooter>
          <sidebar_1.SidebarMenu className="mb-3">
            <sidebar_1.SidebarMenuItem className={state === "collapsed" || isMobile
            ? "w-full flex justify-center"
            : ""}>
              <dropdown_menu_1.DropdownMenu>
                <dropdown_menu_1.DropdownMenuTrigger asChild className="hover:cursor-pointer">
                  <sidebar_1.SidebarMenuButton className={"flex ".concat(state === "collapsed"
            ? "justify-center w-full "
            : "items-center gap-2 ")}>
                    <avatar_1.Avatar className={state === "collapsed" ? "mx-auto" : ""}>
                      <avatar_1.AvatarImage src={user === null || user === void 0 ? void 0 : user.profileImg} alt="@shadcn"/>
                      <avatar_1.AvatarFallback> {initials}</avatar_1.AvatarFallback>
                    </avatar_1.Avatar>
                    {state !== "collapsed" && <p>{user === null || user === void 0 ? void 0 : user.username}</p>}
                  </sidebar_1.SidebarMenuButton>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent side={state === "collapsed" ? "top" : "top"} align={state === "collapsed" ? "start" : "center"} alignOffset={state === "collapsed" ? 8 : 0} sideOffset={state === "collapsed" ? 8 : 6} className="w-56 p-2 border rounded-lg shadow-lg animate-in slide-in-from-bottom-5 duration-200">
                  <div className="px-3 py-2 mb-1 border-b border-gray-100">
                    <p className="font-medium">{user === null || user === void 0 ? void 0 : user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user === null || user === void 0 ? void 0 : user.email}
                    </p>
                  </div>

                  <div className="space-y-1 py-1">
                    <dropdown_menu_1.DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors" onClick={function () { return navigate("/profile"); }}>
                      <lucide_react_1.User className="h-4 w-4 text-gray-500"/>
                      <p>Perfil</p>
                    </dropdown_menu_1.DropdownMenuItem>

                    {isAdmin && (<dropdown_menu_1.DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-blue-50 transition-colors text-blue-600" onClick={function () {
                console.log("Clicou no Painel Admin!", {
                    isAdmin: isAdmin,
                    userEmail: user === null || user === void 0 ? void 0 : user.email,
                });
                console.log("Navegando para /admin...");
                navigate("/admin");
                console.log("Navigate executado!");
            }}>
                        <lucide_react_1.Shield className="h-4 w-4 text-blue-500"/>
                        <p>Painel Admin</p>
                      </dropdown_menu_1.DropdownMenuItem>)}

                    <dropdown_menu_1.DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                      <lucide_react_1.Settings className="h-4 w-4 text-gray-500"/>
                      <p>Configurações</p>
                    </dropdown_menu_1.DropdownMenuItem>
                  </div>

                  <div className="h-px bg-gray-100 my-1"></div>
                  <dropdown_menu_1.DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-red-400 hover:bg-red-50 transition-colors" onClick={handleLogout}>
                    <lucide_react_1.LogOut className="h-4 w-4 -scale-x-100"/>
                    <p>Sair</p>
                  </dropdown_menu_1.DropdownMenuItem>
                </dropdown_menu_1.DropdownMenuContent>
              </dropdown_menu_1.DropdownMenu>
            </sidebar_1.SidebarMenuItem>
          </sidebar_1.SidebarMenu>
        </sidebar_1.SidebarFooter>
      </sidebar_1.Sidebar>
    </>);
}
