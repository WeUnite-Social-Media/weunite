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
exports.useWebSocket = void 0;
var react_1 = require("react");
var stompjs_1 = require("@stomp/stompjs");
var sockjs_client_1 = require("sockjs-client");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var react_query_1 = require("@tanstack/react-query");
var useChat_1 = require("@/features/chat/state/useChat");
var useWebSocket = function () {
    var clientRef = (0, react_1.useRef)(null);
    var _a = (0, react_1.useState)(false), isConnected = _a[0], setIsConnected = _a[1];
    var jwt = (0, useAuthStore_1.useAuthStore)(function (state) { return state.jwt; });
    var queryClient = (0, react_query_1.useQueryClient)();
    (0, react_1.useEffect)(function () {
        if (!jwt) {
            console.log("⚠️ WebSocket: JWT não encontrado");
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
        return function () {
            console.log("🔌 WebSocket: Desativando conexão");
            client.deactivate();
        };
    }, [jwt]);
    var subscribeToConversation = (0, react_1.useCallback)(function (conversationId, userId) {
        var _a;
        if (!((_a = clientRef.current) === null || _a === void 0 ? void 0 : _a.connected)) {
            return;
        }
        var subscription = clientRef.current.subscribe("/topic/conversation/".concat(conversationId), function (messageFrame) {
            try {
                // Parseia a mensagem recebida
                var newMessage_1 = JSON.parse(messageFrame.body);
                // Atualiza o cache DIRETAMENTE sem refetch
                queryClient.setQueryData(useChat_1.chatKeys.messagesByConversation(conversationId, userId), function (oldData) {
                    var _a;
                    if (!(oldData === null || oldData === void 0 ? void 0 : oldData.success))
                        return oldData;
                    // Verifica se a mensagem já existe (evita duplicatas)
                    var messageExists = (_a = oldData.data) === null || _a === void 0 ? void 0 : _a.some(function (message) { return message.id === newMessage_1.id; });
                    if (messageExists)
                        return oldData;
                    // Adiciona nova mensagem ao final
                    return __assign(__assign({}, oldData), { data: __spreadArray(__spreadArray([], (oldData.data || []), true), [newMessage_1], false) });
                });
                // Atualiza lista de conversas (última mensagem)
                queryClient.invalidateQueries({
                    queryKey: useChat_1.chatKeys.conversationsByUser(userId),
                });
            }
            catch (error) {
                console.error("Erro ao processar mensagem WebSocket:", error);
            }
        });
        return function () {
            subscription.unsubscribe();
        };
    }, [queryClient]);
    var sendMessage = (0, react_1.useCallback)(function (message) {
        var _a;
        if (!((_a = clientRef.current) === null || _a === void 0 ? void 0 : _a.connected)) {
            throw new Error("WebSocket não está conectado");
        }
        // Cria mensagem otimista para aparecer imediatamente
        var optimisticMessage = {
            id: Date.now(), // ID temporário
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            isRead: false,
            createdAt: new Date().toISOString(),
            readAt: null,
            type: message.type || "TEXT",
        };
        // Adiciona mensagem ao cache IMEDIATAMENTE
        queryClient.setQueryData(useChat_1.chatKeys.messagesByConversation(message.conversationId, message.senderId), function (oldData) {
            if (!(oldData === null || oldData === void 0 ? void 0 : oldData.success))
                return oldData;
            return __assign(__assign({}, oldData), { data: __spreadArray(__spreadArray([], (oldData.data || []), true), [optimisticMessage], false) });
        });
        // Envia via WebSocket - backend salva e notifica todos
        clientRef.current.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(message),
        });
    }, [queryClient]);
    return {
        isConnected: isConnected,
        subscribeToConversation: subscribeToConversation,
        sendMessage: sendMessage,
    };
};
exports.useWebSocket = useWebSocket;
