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
exports.useUploadMessageFile = exports.useMarkMessagesAsRead = exports.useGetConversationMessages = exports.useGetConversationById = exports.useGetUserConversations = exports.useCreateConversation = exports.chatKeys = void 0;
var react_query_1 = require("@tanstack/react-query");
var chatService_1 = require("@/features/chat/api/chatService");
var sonner_1 = require("sonner");
exports.chatKeys = {
    all: ["chat"],
    conversations: function () { return __spreadArray(__spreadArray([], exports.chatKeys.all, true), ["conversations"], false); },
    conversationsByUser: function (userId) {
        return __spreadArray(__spreadArray([], exports.chatKeys.conversations(), true), ["user", userId], false);
    },
    conversationDetail: function (conversationId, userId) {
        return __spreadArray(__spreadArray([], exports.chatKeys.conversations(), true), ["detail", conversationId, userId], false);
    },
    messages: function () { return __spreadArray(__spreadArray([], exports.chatKeys.all, true), ["messages"], false); },
    messagesByConversation: function (conversationId, userId) {
        return __spreadArray(__spreadArray([], exports.chatKeys.messages(), true), ["conversation", conversationId, userId], false);
    },
};
var useCreateConversation = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (data) { return (0, chatService_1.createConversationRequest)(data); },
        onSuccess: function (result, variables) {
            if (result.success) {
                sonner_1.toast.success(result.message || "Conversa criada com sucesso!");
                variables.participantIds.forEach(function (userId) {
                    queryClient.invalidateQueries({
                        queryKey: exports.chatKeys.conversationsByUser(userId),
                    });
                });
            }
            else {
                sonner_1.toast.error(result.error || "Erro ao criar conversa");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao criar conversa");
        },
    });
};
exports.useCreateConversation = useCreateConversation;
var useGetUserConversations = function (userId) {
    return (0, react_query_1.useQuery)({
        queryKey: exports.chatKeys.conversationsByUser(userId),
        queryFn: function () { return (0, chatService_1.getUserConversationsRequest)(userId); },
        staleTime: 30 * 1000, // 30 segundos - confiar em invalidações manuais
        gcTime: 30 * 60 * 1000, // 30 minutos
        refetchOnWindowFocus: false, // ✅ Não refetch ao focar janela
        refetchOnMount: false, // ✅ Usa cache
        notifyOnChangeProps: ["data", "error"], // ✅ Só notifica mudanças em data/error
        placeholderData: function (previousData) { return previousData; }, // ✅ Mantém dados anteriores enquanto carrega
        retry: 2,
        enabled: !!userId,
    });
};
exports.useGetUserConversations = useGetUserConversations;
var useGetConversationById = function (conversationId, userId) {
    return (0, react_query_1.useQuery)({
        queryKey: exports.chatKeys.conversationDetail(conversationId, userId),
        queryFn: function () { return (0, chatService_1.getConversationByIdRequest)(conversationId, userId); },
        staleTime: 30 * 1000,
        retry: 2,
        enabled: !!conversationId && !!userId,
    });
};
exports.useGetConversationById = useGetConversationById;
var useGetConversationMessages = function (conversationId, userId) {
    return (0, react_query_1.useQuery)({
        queryKey: exports.chatKeys.messagesByConversation(conversationId, userId),
        queryFn: function () { return (0, chatService_1.getConversationMessagesRequest)(conversationId, userId); },
        staleTime: 5 * 60 * 1000, // 5 minutos - confiar no WebSocket
        gcTime: 30 * 60 * 1000, // Mantém cache por 30 minutos
        refetchOnWindowFocus: false, // ✅ Nunca refetch ao focar janela
        refetchOnMount: false, // ✅ Nunca refetch ao montar (usa cache)
        refetchOnReconnect: true, // Apenas ao reconectar internet
        notifyOnChangeProps: ["data", "error"], // ✅ Só notifica mudanças em data/error, não em status
        placeholderData: function (previousData) { return previousData; }, // ✅ Mantém dados anteriores enquanto carrega novos (sem tela vazia)
        retry: 2,
        enabled: !!conversationId && !!userId,
    });
};
exports.useGetConversationMessages = useGetConversationMessages;
var useMarkMessagesAsRead = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var conversationId = _a.conversationId, userId = _a.userId;
            return (0, chatService_1.markMessagesAsReadRequest)(conversationId, userId);
        },
        onSuccess: function (result, _a) {
            var conversationId = _a.conversationId, userId = _a.userId;
            if (result.success) {
                queryClient.invalidateQueries({
                    queryKey: exports.chatKeys.conversationsByUser(userId),
                });
                queryClient.invalidateQueries({
                    queryKey: exports.chatKeys.conversationDetail(conversationId, userId),
                });
            }
        },
    });
};
exports.useMarkMessagesAsRead = useMarkMessagesAsRead;
var useUploadMessageFile = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var conversationId = _a.conversationId, senderId = _a.senderId, file = _a.file;
            return (0, chatService_1.uploadMessageFileRequest)(conversationId, senderId, file);
        },
        onSuccess: function (result, _a) {
            var conversationId = _a.conversationId, senderId = _a.senderId, fileType = _a.fileType;
            if (result.success) {
                var successMessage = fileType === "audio"
                    ? "Áudio enviado com sucesso!"
                    : result.message || "Arquivo enviado com sucesso!";
                sonner_1.toast.success(successMessage);
                queryClient.invalidateQueries({
                    queryKey: exports.chatKeys.messagesByConversation(conversationId, senderId),
                });
            }
            else {
                sonner_1.toast.error(result.error || "Erro ao enviar arquivo");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro ao fazer upload do arquivo");
        },
    });
};
exports.useUploadMessageFile = useUploadMessageFile;
