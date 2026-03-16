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
exports.ConversationList = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/shared/components/ui/input");
var useSearchUsers_1 = require("@/features/profile/hooks/useSearchUsers");
var useChat_1 = require("@/features/chat/state/useChat");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
exports.ConversationList = (0, react_1.memo)(function (_a) {
    var conversations = _a.conversations, activeConversationId = _a.activeConversationId, onSelectConversation = _a.onSelectConversation, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b;
    var _c = (0, react_1.useState)(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var userId = (0, useAuthStore_1.useAuthStore)(function (state) { var _a; return (_a = state.user) === null || _a === void 0 ? void 0 : _a.id; });
    var _d = (0, useSearchUsers_1.useSearchUsers)(searchQuery), searchResults = _d.data, isSearching = _d.isLoading;
    var createConversation = (0, useChat_1.useCreateConversation)();
    var handleSearch = function (e) {
        setSearchQuery(e.target.value);
    };
    var startNewConversation = function (targetUserId) { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId) {
                        console.log("❌ userId não está definido");
                        return [2 /*return*/];
                    }
                    console.log("🚀 Iniciando criação de conversa:", {
                        userId: userId,
                        targetUserId: targetUserId,
                        participantIds: [Number(userId), Number(targetUserId)],
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, createConversation.mutateAsync({
                            initiatorUserId: Number(userId),
                            participantIds: [Number(userId), Number(targetUserId)],
                        })];
                case 2:
                    result = _a.sent();
                    console.log("✅ Resultado da criação:", result);
                    if (result.success && result.data) {
                        console.log("✅ Conversa criada com sucesso! ID:", result.data.id);
                        // Limpa a busca primeiro
                        setSearchQuery("");
                        // Seleciona a conversa (a invalidação já é feita pelo mutation no useChat.ts)
                        onSelectConversation(result.data.id);
                    }
                    else {
                        console.error("❌ Falha ao criar conversa:", result.error);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("❌ Erro ao criar conversa:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<div className={"".concat(isMobile ? "w-full h-full min-h-0" : "w-80 md:w-96 h-full", " ").concat(!isMobile ? "border-r border-border" : "", " bg-card flex flex-col overflow-hidden")}>
        <div className="p-3 md:p-4 border-b border-border sticky top-0 z-10 bg-card shrink-0">
          <h1 className="text-lg md:text-xl font-semibold mb-3">Conversas</h1>
          <div className="relative">
            <input_1.Input type="text" value={searchQuery} onChange={handleSearch} className="pl-9" placeholder="Pesquisar usuários..."/>
            <lucide_react_1.Search size={18} className="absolute left-3 top-2.5 text-muted-foreground"/>
          </div>
        </div>

        {searchQuery.length > 0 ? (<div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            <div className="p-3 bg-muted text-sm text-muted-foreground font-medium">
              Resultados da pesquisa
            </div>
            {isSearching ? (<div className="flex items-center justify-center p-8">
                <lucide_react_1.Loader2 size={24} className="animate-spin text-primary"/>
              </div>) : searchResults && searchResults.length > 0 ? (searchResults
                .filter(function (user) { return user.id !== String(userId); })
                .map(function (user) {
                var userName = user.name || "Usuário desconhecido";
                var initials = userName
                    .split(" ")
                    .map(function (n) { return n[0]; })
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "??";
                return (<div key={user.id} className="flex items-center p-3 hover:bg-muted cursor-pointer border-b border-border" onClick={function () { return user.id && startNewConversation(user.id); }}>
                      {user.profileImg ? (<img src={user.profileImg} alt={userName} className="w-10 h-10 rounded-full object-cover mr-3"/>) : (<div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center mr-3">
                          <span className="font-medium">{initials}</span>
                        </div>)}
                      <div className="flex-1">
                        <div className="font-medium">{userName}</div>
                        {user.username && (<div className="text-xs text-muted-foreground">
                            @{user.username}
                          </div>)}
                      </div>
                      <button className="p-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20" disabled={createConversation.isPending}>
                        {createConversation.isPending ? (<lucide_react_1.Loader2 size={16} className="animate-spin"/>) : (<lucide_react_1.Plus size={16}/>)}
                      </button>
                    </div>);
            })) : (<div className="p-4 text-center text-muted-foreground">
                Nenhum usuário encontrado
              </div>)}
          </div>) : (<div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            {conversations.length > 0 ? (conversations.map(function (conversation) { return (<div key={conversation.id} className={"flex items-center p-3 cursor-pointer border-b border-border ".concat(activeConversationId === conversation.id
                    ? "bg-primary/10"
                    : "hover:bg-muted")} onClick={function () { return onSelectConversation(conversation.id); }}>
                  <div className="relative">
                    {conversation.avatar.startsWith("http") ? (<img src={conversation.avatar} alt={conversation.name} className="w-10 h-10 rounded-full object-cover mr-3"/>) : (<div className={"w-10 h-10 rounded-full ".concat(conversation.avatarColor, " flex items-center justify-center mr-3")}>
                        <span className="font-medium">
                          {conversation.avatar}
                        </span>
                      </div>)}
                    {conversation.online && (<div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">
                        {conversation.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conversation.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate max-w-[80%]">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unread > 0 && (<span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conversation.unread}
                        </span>)}
                    </div>
                  </div>
                </div>); })) : (<div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground mb-2">
                  Nenhuma conversa ainda
                </p>
                <p className="text-sm text-muted-foreground">
                  Use a barra de pesquisa acima para encontrar usuários
                </p>
              </div>)}
          </div>)}
      </div>);
});
exports.ConversationList.displayName = "ConversationList";
