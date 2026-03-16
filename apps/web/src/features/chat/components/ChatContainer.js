"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ChatContainer = void 0;
var react_1 = require("react");
var ChatHeader_1 = require("@/features/chat/components/ChatHeader");
var MessageList_1 = require("@/features/chat/components/MessageList");
var MessageInput_1 = require("@/features/chat/components/MessageInput");
var TypingIndicator_1 = require("@/features/chat/components/TypingIndicator");
var hapticFeedback_1 = require("@/shared/utils/hapticFeedback");
var WebSocketContext_1 = require("@/features/chat/context/WebSocketContext");
var useChat_1 = require("@/features/chat/state/useChat");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var useOnlineStatus_1 = require("@/features/chat/hooks/useOnlineStatus");
var ChatContainer = function (_a) {
    var activeConversation = _a.activeConversation, onBack = _a.onBack, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b;
    var userId = (0, useAuthStore_1.useAuthStore)(function (state) { var _a; return (_a = state.user) === null || _a === void 0 ? void 0 : _a.id; });
    var isOtherTyping = (0, react_1.useState)(false)[0];
    // ✅ Hook para rastrear status online do outro usuário
    var isOtherUserOnline = (0, useOnlineStatus_1.useOnlineStatus)(activeConversation === null || activeConversation === void 0 ? void 0 : activeConversation.otherUserId);
    // Pull-to-refresh state
    var _c = (0, react_1.useState)(false), isRefreshing = _c[0], setIsRefreshing = _c[1];
    var _d = (0, react_1.useState)(0), pullDistance = _d[0], setPullDistance = _d[1];
    var messageAreaRef = (0, react_1.useRef)(null);
    // Swipe gesture state
    var containerRef = (0, react_1.useRef)(null);
    var _e = (0, react_1.useState)(null), touchStart = _e[0], setTouchStart = _e[1];
    var _f = (0, react_1.useState)(null), touchEnd = _f[0], setTouchEnd = _f[1];
    var _g = (0, react_1.useState)(null), touchStartY = _g[0], setTouchStartY = _g[1];
    var messagesData = (0, useChat_1.useGetConversationMessages)((activeConversation === null || activeConversation === void 0 ? void 0 : activeConversation.id) || 0, Number(userId) || 0).data;
    var markAsRead = (0, useChat_1.useMarkMessagesAsRead)().mutate;
    var _h = (0, WebSocketContext_1.useWebSocket)(), isConnected = _h.isConnected, subscribeToConversation = _h.subscribeToConversation, sendMessage = _h.sendMessage;
    var messages = (messagesData === null || messagesData === void 0 ? void 0 : messagesData.success) ? messagesData.data || [] : [];
    // ✅ Inscreve no WebSocket para receber mensagens em tempo real
    (0, react_1.useEffect)(function () {
        if (!(activeConversation === null || activeConversation === void 0 ? void 0 : activeConversation.id) || !userId)
            return;
        console.log("📡 Inscrito no chat em tempo real:", activeConversation.id);
        var unsubscribe = subscribeToConversation(activeConversation.id, Number(userId));
        // ✅ Marca como lido apenas uma vez quando abre a conversa
        // Usa setTimeout para garantir que as mensagens já foram carregadas
        var timeoutId = setTimeout(function () {
            markAsRead({
                conversationId: activeConversation.id,
                userId: Number(userId),
            });
        }, 500);
        return function () {
            clearTimeout(timeoutId);
            console.log("📴 Desinscrito do chat:", activeConversation.id);
            if (unsubscribe)
                unsubscribe();
        };
        // ✅ APENAS quando conversa ativa ou userId mudam, não quando mensagens chegam
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeConversation === null || activeConversation === void 0 ? void 0 : activeConversation.id, userId]);
    // ✅ Auto-scroll quando novas mensagens chegam
    (0, react_1.useEffect)(function () {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
        if (messages.length > 0) {
            console.log("📨 Total de mensagens:", messages.length);
        }
    }, [messages]);
    // Handle touch events for swipe and pull-to-refresh
    var handleTouchStart = function (e) {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
        setTouchStartY(e.targetTouches[0].clientY);
    };
    var handleTouchMove = function (e) {
        setTouchEnd(e.targetTouches[0].clientX);
        // Handle pull-to-refresh only if we're at the top of messages
        if (messageAreaRef.current && touchStartY !== null) {
            var scrollTop = messageAreaRef.current.scrollTop;
            var currentY = e.targetTouches[0].clientY;
            var deltaY = currentY - touchStartY;
            if (scrollTop === 0 && deltaY > 0 && deltaY < 100) {
                setPullDistance(deltaY);
                e.preventDefault(); // Prevent default scroll behavior
            }
        }
    };
    var handleTouchEnd = function () {
        if (!touchStart || !touchEnd)
            return;
        var distance = touchStart - touchEnd;
        var isRightSwipe = distance < -50;
        // Swipe right to go back on mobile
        if (isRightSwipe && isMobile && onBack) {
            (0, hapticFeedback_1.triggerHapticFeedback)("light");
            onBack();
        }
        // Handle pull-to-refresh
        if (pullDistance > 60) {
            handleRefresh();
        }
        setPullDistance(0);
    };
    var handleRefresh = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setIsRefreshing(true);
            (0, hapticFeedback_1.triggerHapticFeedback)("medium");
            // Simulate loading new messages
            setTimeout(function () {
                setIsRefreshing(false);
                // Could add new messages here in a real app
            }, 1500);
            return [2 /*return*/];
        });
    }); };
    var handleSendMessage = function (text) {
        if (!(activeConversation === null || activeConversation === void 0 ? void 0 : activeConversation.id) || !userId || !isConnected)
            return;
        (0, hapticFeedback_1.triggerHapticFeedback)("light");
        sendMessage({
            conversationId: activeConversation.id,
            senderId: Number(userId),
            content: text,
            type: "TEXT",
        });
    };
    if (!activeConversation) {
        return (<div className="flex h-full items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Selecione uma conversa para começar
        </p>
      </div>);
    }
    return (<div ref={containerRef} className={"".concat(isMobile ? "w-full h-full" : "flex-1 h-full", " relative ").concat(!isMobile ? "rounded-r-lg bg-background" : "")} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* Header fixo no topo */}
      <div className={"absolute top-0 left-0 right-0 z-10 ".concat(!isMobile ? "rounded-tr-lg" : "")}>
        <ChatHeader_1.ChatHeader conversation={activeConversation
            ? __assign(__assign({}, activeConversation), { online: isOtherUserOnline, otherUserId: activeConversation.otherUserId }) : undefined} onBack={onBack} isMobile={isMobile}/>
      </div>

      {/* Área de mensagens com scroll */}
      <div ref={messageAreaRef} className={"absolute top-16 left-0 right-0 overflow-y-auto bg-background custom-scrollbar ".concat(isMobile ? "bottom-20" : "bottom-[80px]")} style={{
            transform: pullDistance > 0
                ? "translateY(".concat(Math.min(pullDistance * 0.5, 30), "px)")
                : "none",
        }}>
        {/* Pull-to-refresh indicator */}
        {(pullDistance > 0 || isRefreshing) && (<div className="flex justify-center items-center py-4">
            <div className={"transition-all duration-200 ".concat(isRefreshing ? "animate-spin" : "")}>
              {isRefreshing ? (<div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>) : (<div className={"text-sm text-muted-foreground transition-opacity duration-200 ".concat(pullDistance > 60 ? "opacity-100" : "opacity-50")}>
                  {pullDistance > 60
                    ? "↓ Solte para atualizar"
                    : "↓ Puxe para atualizar"}
                </div>)}
            </div>
          </div>)}
        <MessageList_1.MessageList messages={messages.map(function (msg) { return ({
            id: msg.id,
            text: msg.content,
            sender: msg.senderId === Number(userId) ? "me" : "other",
            time: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            read: msg.isRead,
        }); })}/>
        <TypingIndicator_1.TypingIndicator isTyping={isOtherTyping} userName={activeConversation === null || activeConversation === void 0 ? void 0 : activeConversation.name}/>
      </div>

      <div className={"absolute bottom-0 left-0 right-0 z-10 ".concat(!isMobile ? "rounded-br-lg" : "")}>
        <MessageInput_1.MessageInput conversationId={activeConversation.id} senderId={Number(userId)} onSendMessage={handleSendMessage}/>
      </div>
    </div>);
};
exports.ChatContainer = ChatContainer;
