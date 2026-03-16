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
exports.ChatLayout = void 0;
var react_1 = require("react");
var ChatContainer_1 = require("@/features/chat/components/ChatContainer");
var ConversationList_1 = require("@/features/chat/components/ConversationList");
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
var useChat_1 = require("@/features/chat/state/useChat");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var useChatStore_1 = require("@/features/chat/stores/useChatStore");
var userService_1 = require("@/features/profile/api/userService");
var formatMessagePreview_1 = require("@/shared/utils/formatMessagePreview");
var ChatLayout = function () {
    var userId = (0, useAuthStore_1.useAuthStore)(function (state) { var _a; return (_a = state.user) === null || _a === void 0 ? void 0 : _a.id; });
    var _a = (0, react_1.useState)(null), activeConversationId = _a[0], setActiveConversationId = _a[1];
    var _b = (0, react_1.useState)(true), showConversations = _b[0], setShowConversations = _b[1];
    var maxLeftSideBar = (0, useBreakpoints_1.useBreakpoints)().maxLeftSideBar;
    var _c = (0, react_1.useState)([]), conversationsWithUsers = _c[0], setConversationsWithUsers = _c[1];
    var setIsConversationOpen = (0, useChatStore_1.useChatStore)(function (state) { return state.setIsConversationOpen; });
    var conversationsData = (0, useChat_1.useGetUserConversations)(Number(userId) || 0).data;
    (0, react_1.useEffect)(function () {
        var loadUsersData = function () { return __awaiter(void 0, void 0, void 0, function () {
            var conversationsWithUserData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(conversationsData === null || conversationsData === void 0 ? void 0 : conversationsData.success) ||
                            !conversationsData.data ||
                            conversationsData.data.length === 0) {
                            setConversationsWithUsers([]);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all(conversationsData.data.map(function (conv) { return __awaiter(void 0, void 0, void 0, function () {
                                var otherParticipantId, userResponse, user, initials, hasValidImage, error_2;
                                var _a, _b, _c, _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            otherParticipantId = conv.participantIds.find(function (id) { return id !== Number(userId); });
                                            if (!otherParticipantId) {
                                                return [2 /*return*/, {
                                                        id: conv.id,
                                                        name: "Usuário Desconhecido",
                                                        avatar: "?",
                                                        avatarColor: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300",
                                                        lastMessage: (0, formatMessagePreview_1.formatMessagePreview)(((_a = conv.lastMessage) === null || _a === void 0 ? void 0 : _a.content) || ""),
                                                        time: conv.lastMessage
                                                            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })
                                                            : "",
                                                        unread: conv.unreadCount,
                                                        online: false,
                                                        otherUserId: 0,
                                                    }];
                                            }
                                            _e.label = 1;
                                        case 1:
                                            _e.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, (0, userService_1.getUserById)(otherParticipantId)];
                                        case 2:
                                            userResponse = _e.sent();
                                            if (userResponse.success && userResponse.data) {
                                                user = userResponse.data;
                                                initials = ((_b = user.name) === null || _b === void 0 ? void 0 : _b.split(" ").map(function (n) { return n[0]; }).join("").toUpperCase().slice(0, 2)) || "??";
                                                hasValidImage = user.profileImg &&
                                                    (user.profileImg.startsWith("http://") ||
                                                        user.profileImg.startsWith("https://") ||
                                                        user.profileImg.startsWith("data:"));
                                                return [2 /*return*/, {
                                                        id: conv.id,
                                                        name: user.name || "User ".concat(otherParticipantId),
                                                        avatar: hasValidImage ? user.profileImg : initials,
                                                        avatarColor: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
                                                        lastMessage: (0, formatMessagePreview_1.formatMessagePreview)(((_c = conv.lastMessage) === null || _c === void 0 ? void 0 : _c.content) || ""),
                                                        time: conv.lastMessage
                                                            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })
                                                            : "",
                                                        unread: conv.unreadCount,
                                                        online: false,
                                                        otherUserId: otherParticipantId,
                                                    }];
                                            }
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_2 = _e.sent();
                                            console.error("Erro ao buscar usu\u00E1rio ".concat(otherParticipantId, ":"), error_2);
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/, {
                                                id: conv.id,
                                                name: "User ".concat(otherParticipantId),
                                                avatar: "U",
                                                avatarColor: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
                                                lastMessage: (0, formatMessagePreview_1.formatMessagePreview)(((_d = conv.lastMessage) === null || _d === void 0 ? void 0 : _d.content) || ""),
                                                time: conv.lastMessage
                                                    ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : "",
                                                unread: conv.unreadCount,
                                                online: false,
                                                otherUserId: otherParticipantId,
                                            }];
                                    }
                                });
                            }); }))];
                    case 2:
                        conversationsWithUserData = _a.sent();
                        setConversationsWithUsers(conversationsWithUserData);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Erro ao carregar dados dos usuários:", error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        loadUsersData();
    }, [conversationsData, userId]);
    (0, react_1.useEffect)(function () {
        if (!activeConversationId && conversationsWithUsers.length > 0) {
            setActiveConversationId(conversationsWithUsers[0].id);
        }
    }, [activeConversationId, conversationsWithUsers]);
    // Limpa o estado quando não estiver mais no mobile ou ao desmontar o componente
    (0, react_1.useEffect)(function () {
        if (!maxLeftSideBar) {
            setIsConversationOpen(false);
        }
        return function () {
            setIsConversationOpen(false);
        };
    }, [maxLeftSideBar, setIsConversationOpen]);
    var activeConversation = (0, react_1.useMemo)(function () {
        return conversationsWithUsers.find(function (conv) { return conv.id === activeConversationId; });
    }, [conversationsWithUsers, activeConversationId]);
    var handleSelectConversation = (0, react_1.useCallback)(function (id) {
        setActiveConversationId(id);
        if (maxLeftSideBar) {
            setShowConversations(false);
            setIsConversationOpen(true); // Marca que uma conversa está aberta no mobile
        }
    }, [maxLeftSideBar, setIsConversationOpen]);
    var handleBack = (0, react_1.useCallback)(function () {
        setShowConversations(true);
        setIsConversationOpen(false); // Marca que voltou para a lista de conversas
    }, [setIsConversationOpen]);
    // ✅ REMOVIDO: Loading global que causava tela laranja ao trocar de conversa
    // Agora usa placeholderData para transição suave
    return (<div className={"flex w-full h-[98vh] bg-red ".concat(!maxLeftSideBar ? "rounded-lg shadow-sm border border-border -mt-[0.7em]" : "", " ").concat(maxLeftSideBar ? "min-h-0" : "")}>
      {/* Mobile/Tablet: Mostra apenas uma tela por vez */}
      {maxLeftSideBar ? (<>
          {showConversations ? (<ConversationList_1.ConversationList conversations={conversationsWithUsers} activeConversationId={(activeConversation === null || activeConversation === void 0 ? void 0 : activeConversation.id) || 0} onSelectConversation={handleSelectConversation} isMobile={true}/>) : activeConversation ? (<ChatContainer_1.ChatContainer activeConversation={activeConversation} onBack={handleBack} isMobile={true}/>) : (<div className="flex h-full items-center justify-center p-4">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Selecione uma conversa ou pesquise um usuário para começar
              </p>
            </div>)}
        </>) : (
        /* Desktop: Mostra ambas as telas lado a lado */
        <div className="flex w-full h-full gap-0">
          <ConversationList_1.ConversationList conversations={conversationsWithUsers} activeConversationId={(activeConversation === null || activeConversation === void 0 ? void 0 : activeConversation.id) || 0} onSelectConversation={handleSelectConversation} isMobile={false}/>
          {activeConversation ? (<ChatContainer_1.ChatContainer activeConversation={activeConversation} onBack={handleBack} isMobile={false}/>) : (<div className="flex-1 flex items-center justify-center p-4">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Nenhuma conversa encontrada
                <br />
                Use a barra de pesquisa para encontrar usuários e iniciar uma
                conversa
              </p>
            </div>)}
        </div>)}
    </div>);
};
exports.ChatLayout = ChatLayout;
