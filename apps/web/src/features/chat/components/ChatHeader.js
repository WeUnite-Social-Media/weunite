"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHeader = void 0;
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/shared/components/ui/button");
var react_1 = require("react");
var sheet_1 = require("@/shared/components/ui/sheet");
var dialog_1 = require("@/shared/components/ui/dialog");
var react_query_1 = require("@tanstack/react-query");
var userService_1 = require("@/features/profile/api/userService");
var skeleton_1 = require("@/shared/components/ui/skeleton");
var react_router_dom_1 = require("react-router-dom");
var ChatHeader = function (_a) {
    var conversation = _a.conversation, onBack = _a.onBack, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b;
    var _c = (0, react_1.useState)(false), isProfileOpen = _c[0], setIsProfileOpen = _c[1];
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _d = (0, react_query_1.useQuery)({
        queryKey: ["user-profile", conversation === null || conversation === void 0 ? void 0 : conversation.otherUserId],
        queryFn: function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(conversation === null || conversation === void 0 ? void 0 : conversation.otherUserId))
                            return [2 /*return*/, null];
                        return [4 /*yield*/, (0, userService_1.getUserById)(conversation.otherUserId)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.success ? result.data : null];
                }
            });
        }); },
        enabled: !!(conversation === null || conversation === void 0 ? void 0 : conversation.otherUserId) && isProfileOpen,
    }), userProfile = _d.data, isLoading = _d.isLoading;
    if (!conversation)
        return null;
    var ProfilePreview = function () {
        var _a;
        return (<div className="space-y-4">
      {isLoading ? (<div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <skeleton_1.Skeleton className="w-24 h-24 rounded-full"/>
            <skeleton_1.Skeleton className="h-6 w-40"/>
            <skeleton_1.Skeleton className="h-4 w-32"/>
          </div>
        </div>) : userProfile ? (<div className="space-y-6">
          {/* Profile Info */}
          <div className="flex flex-col items-center gap-3 mt-4 relative">
            {userProfile.profileImg ? (<img src={userProfile.profileImg} alt={userProfile.name} className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"/>) : (<div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center border-4 border-background shadow-lg text-2xl font-bold">
                {((_a = userProfile.name) === null || _a === void 0 ? void 0 : _a.split(" ").map(function (n) { return n[0]; }).join("").toUpperCase().slice(0, 2)) || "??"}
              </div>)}

            <div className="text-center">
              <h3 className="text-xl font-semibold">{userProfile.name}</h3>
              {userProfile.username && (<p className="text-sm text-muted-foreground">
                  @{userProfile.username}
                </p>)}
              {conversation.online && (<p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                  Online agora
                </p>)}
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-3 px-2">
            {userProfile.role && (<div className="text-center">
                <p className="text-xs text-muted-foreground">Tipo de Conta</p>
                <p className="text-sm font-medium">
                  {userProfile.role.toLowerCase() === "athlete"
                        ? "Atleta"
                        : "Empresa"}
                </p>
              </div>)}
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <button_1.Button className={isMobile ? "w-auto px-16 h-10 text-sm" : "w-full"} onClick={function () {
                    setIsProfileOpen(false);
                    navigate("/profile/".concat(userProfile.username));
                }}>
              Ver Perfil Completo
            </button_1.Button>
          </div>
        </div>) : (<div className="text-center py-8">
          <p className="text-muted-foreground">
            Não foi possível carregar as informações do usuário
          </p>
        </div>)}
    </div>);
    };
    var InfoButton = (<button_1.Button variant="ghost" size="icon" onClick={function () { return setIsProfileOpen(true); }}>
      <lucide_react_1.Info size={18}/>
    </button_1.Button>);
    return (<div className="h-16 border-b border-border px-4 md:px-6 flex items-center justify-between bg-card">
      <div className="flex items-center">
        {isMobile && onBack && (<button_1.Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <lucide_react_1.ArrowLeft size={20}/>
          </button_1.Button>)}
        <div className="relative">
          {conversation.avatar.startsWith("http") ? (<img src={conversation.avatar} alt={conversation.name} className="w-10 h-10 rounded-full object-cover mr-3"/>) : (<div className={"w-10 h-10 rounded-full ".concat(conversation.avatarColor, " flex items-center justify-center mr-3")}>
              <span className="font-medium">{conversation.avatar}</span>
            </div>)}
          {/* Indicador de status online */}
          {conversation.online && (<div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>)}
        </div>
        <div>
          <h2 className="font-medium">{conversation.name}</h2>
          <p className="text-xs text-muted-foreground">
            {conversation.online ? (<span className="text-green-600 dark:text-green-400 font-medium">
                Online
              </span>) : ("Offline")}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button_1.Button variant="ghost" size="icon">
          <lucide_react_1.Phone size={18}/>
        </button_1.Button>
        <button_1.Button variant="ghost" size="icon">
          <lucide_react_1.Video size={18}/>
        </button_1.Button>

        {isMobile ? (<sheet_1.Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <sheet_1.SheetTrigger asChild>{InfoButton}</sheet_1.SheetTrigger>
            <sheet_1.SheetContent side="bottom" className="h-[85vh]">
              <sheet_1.SheetHeader>
                <sheet_1.SheetTitle>Informações do Usuário</sheet_1.SheetTitle>
              </sheet_1.SheetHeader>
              <div className="mt-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                <ProfilePreview />
              </div>
            </sheet_1.SheetContent>
          </sheet_1.Sheet>) : (<dialog_1.Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <dialog_1.DialogTrigger asChild>{InfoButton}</dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-lg">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Informações do Usuário</dialog_1.DialogTitle>
              </dialog_1.DialogHeader>
              <div className="mt-4 overflow-y-auto max-h-[75vh]">
                <ProfilePreview />
              </div>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>)}
      </div>
    </div>);
};
exports.ChatHeader = ChatHeader;
