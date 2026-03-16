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
exports.useWebSocket = exports.WebSocketProvider = void 0;
var react_1 = require("react");
var stompjs_1 = require("@stomp/stompjs");
var sockjs_client_1 = require("sockjs-client");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var react_query_1 = require("@tanstack/react-query");
var useChat_1 = require("@/features/chat/state/useChat");
var WebSocketContext = (0, react_1.createContext)(null);
var WebSocketProvider = function (_a) {
    var children = _a.children;
    var clientRef = (0, react_1.useRef)(null);
    var _b = (0, react_1.useState)(false), isConnected = _b[0], setIsConnected = _b[1];
    var jwt = (0, useAuthStore_1.useAuthStore)(function (state) { return state.jwt; });
    var userId = (0, useAuthStore_1.useAuthStore)(function (state) { var _a; return (_a = state.user) === null || _a === void 0 ? void 0 : _a.id; });
    var queryClient = (0, react_query_1.useQueryClient)();
    // ✅ Cria a conexão WebSocket UMA ÚNICA VEZ quando o app carrega
    (0, react_1.useEffect)(function () {
        var _a;
        if (!jwt) {
            console.log("⚠️ WebSocket: JWT não encontrado");
            return;
        }
        // ✅ Se já existe uma conexão ativa, não recria
        if ((_a = clientRef.current) === null || _a === void 0 ? void 0 : _a.connected) {
            console.log("✅ WebSocket: Já conectado, reutilizando conexão");
            return;
        }
        console.log("🚀 WebSocket: Tentando conectar...");
        console.log("📝 Token (primeiros 50 chars):", jwt.substring(0, 50) + "...");
        var client = new stompjs_1.Client({
            webSocketFactory: function () {
                console.log("🔌 Criando conexão SockJS...");
                var socket = new sockjs_client_1.default("http://localhost:8080/ws");
                socket.onopen = function () { return console.log("✅ SockJS: Conexão aberta"); };
                socket.onerror = function (e) { return console.error("❌ SockJS: Erro", e); };
                socket.onclose = function (e) { return console.log("⚠️ SockJS: Conexão fechada", e); };
                return socket;
            },
            connectHeaders: {
                Authorization: "Bearer ".concat(jwt),
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: function (frame) {
                console.log("✅ WebSocket: STOMP conectado com sucesso!", frame);
                setIsConnected(true);
                // Notifica que o usuário está online
                if (userId) {
                    setTimeout(function () {
                        client.publish({
                            destination: "/app/user.status",
                            body: JSON.stringify({
                                userId: Number(userId),
                                status: "ONLINE",
                            }),
                        });
                        console.log("\u2705 Usu\u00E1rio ".concat(userId, " marcado como ONLINE"));
                    }, 500);
                }
            },
            onDisconnect: function () {
                console.log("⚠️ WebSocket: STOMP desconectado");
                setIsConnected(false);
            },
            onStompError: function (frame) {
                console.error("❌ WebSocket STOMP error:", {
                    command: frame.command,
                    headers: frame.headers,
                    body: frame.body,
                });
                // Verifica se é erro de token expirado
                if (frame.body && frame.body.includes("expired")) {
                    console.log("⚠️ Token expirado no WebSocket, fazendo logout...");
                    useAuthStore_1.useAuthStore.getState().logout();
                    window.location.href = "/auth/login";
                }
            },
            onWebSocketError: function (event) {
                console.error("❌ WebSocket connection error:", event);
            },
            onWebSocketClose: function (event) {
                console.log("🔌 WebSocket fechado:", {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean,
                });
            },
        });
        console.log("🔄 Ativando cliente WebSocket...");
        client.activate();
        clientRef.current = client;
        // ✅ Notifica OFFLINE quando o usuário sair da página
        var handleBeforeUnload = function () {
            if (userId && client.connected) {
                client.publish({
                    destination: "/app/user.status",
                    body: JSON.stringify({ userId: Number(userId), status: "OFFLINE" }),
                });
                console.log("\uD83D\uDCF4 Usu\u00E1rio ".concat(userId, " marcado como OFFLINE"));
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        // ✅ Cleanup apenas quando o app desmonta (praticamente nunca)
        return function () {
            console.log("🔌 WebSocket: Desativando conexão (app desmontado)");
            handleBeforeUnload();
            window.removeEventListener("beforeunload", handleBeforeUnload);
            client.deactivate();
        };
    }, [jwt, userId]);
    var subscribeToConversation = (0, react_1.useCallback)(function (conversationId, userId) {
        var _a;
        if (!((_a = clientRef.current) === null || _a === void 0 ? void 0 : _a.connected)) {
            console.warn("⚠️ WebSocket não conectado, aguardando...");
            return;
        }
        console.log("\uD83D\uDCE1 Inscrevendo em /topic/conversation/".concat(conversationId));
        var subscription = clientRef.current.subscribe("/topic/conversation/".concat(conversationId), function (messageFrame) {
            try {
                // Parseia a mensagem recebida
                var newMessage_1 = JSON.parse(messageFrame.body);
                console.log("📩 Nova mensagem recebida via WebSocket:", newMessage_1);
                // Atualiza o cache DIRETAMENTE sem refetch
                queryClient.setQueryData(useChat_1.chatKeys.messagesByConversation(conversationId, userId), function (oldData) {
                    var _a;
                    if (!(oldData === null || oldData === void 0 ? void 0 : oldData.success))
                        return oldData;
                    // Verifica se a mensagem já existe (evita duplicatas)
                    var messageExists = (_a = oldData.data) === null || _a === void 0 ? void 0 : _a.some(function (message) { return message.id === newMessage_1.id; });
                    if (messageExists) {
                        console.log("⚠️ Mensagem duplicada ignorada:", newMessage_1.id);
                        return oldData;
                    }
                    console.log("✅ Adicionando mensagem ao cache");
                    // Adiciona nova mensagem ao final
                    return __assign(__assign({}, oldData), { data: __spreadArray(__spreadArray([], (oldData.data || []), true), [newMessage_1], false) });
                });
                // Atualiza lista de conversas (última mensagem)
                queryClient.invalidateQueries({
                    queryKey: useChat_1.chatKeys.conversationsByUser(userId),
                });
            }
            catch (error) {
                console.error("❌ Erro ao processar mensagem WebSocket:", error);
            }
        });
        return function () {
            console.log("\uD83D\uDCF4 Desinscrevendo de /topic/conversation/".concat(conversationId));
            subscription.unsubscribe();
        };
    }, [queryClient]);
    var sendMessage = (0, react_1.useCallback)(function (message) {
        var _a;
        if (!((_a = clientRef.current) === null || _a === void 0 ? void 0 : _a.connected)) {
            console.error("❌ WebSocket não está conectado");
            throw new Error("WebSocket não está conectado");
        }
        console.log("📤 Enviando mensagem via WebSocket:", message);
        // ✅ Envia via WebSocket - backend salva e notifica todos
        // A mensagem vai chegar via subscribeToConversation para TODOS os usuários (incluindo o remetente)
        clientRef.current.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(message),
        });
        console.log("✅ Mensagem enviada, aguardando confirmação do servidor");
    }, []);
    // ✅ Inscreve-se para receber atualizações de status de um usuário específico
    var subscribeToUserStatus = (0, react_1.useCallback)(function (userId, onStatusChange) {
        var _a;
        if (!((_a = clientRef.current) === null || _a === void 0 ? void 0 : _a.connected)) {
            console.warn("⚠️ WebSocket não conectado para status de usuário");
            return;
        }
        console.log("\uD83D\uDC64 Inscrevendo no status do usu\u00E1rio ".concat(userId));
        var subscription = clientRef.current.subscribe("/topic/user/".concat(userId, "/status"), function (statusFrame) {
            try {
                var statusData = JSON.parse(statusFrame.body);
                console.log("\uD83D\uDCCA Status atualizado do usu\u00E1rio ".concat(userId, ":"), statusData);
                onStatusChange(statusData.status);
            }
            catch (error) {
                console.error("❌ Erro ao processar status do usuário:", error);
            }
        });
        return function () {
            console.log("\uD83D\uDCF4 Desinscrevendo do status do usu\u00E1rio ".concat(userId));
            subscription.unsubscribe();
        };
    }, []);
    // ✅ Notifica o servidor sobre mudança de status do usuário atual
    var notifyOnlineStatus = (0, react_1.useCallback)(function (userId, status) {
        var _a;
        if (!((_a = clientRef.current) === null || _a === void 0 ? void 0 : _a.connected)) {
            console.warn("⚠️ WebSocket não conectado para notificar status");
            return;
        }
        console.log("\uD83D\uDCE2 Notificando status ".concat(status, " para usu\u00E1rio ").concat(userId));
        clientRef.current.publish({
            destination: "/app/user.status",
            body: JSON.stringify({ userId: userId, status: status }),
        });
    }, []);
    return (<WebSocketContext.Provider value={{
            isConnected: isConnected,
            subscribeToConversation: subscribeToConversation,
            sendMessage: sendMessage,
            subscribeToUserStatus: subscribeToUserStatus,
            notifyOnlineStatus: notifyOnlineStatus,
        }}>
      {children}
    </WebSocketContext.Provider>);
};
exports.WebSocketProvider = WebSocketProvider;
var useWebSocket = function () {
    var context = (0, react_1.useContext)(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket deve ser usado dentro de WebSocketProvider");
    }
    return context;
};
exports.useWebSocket = useWebSocket;
