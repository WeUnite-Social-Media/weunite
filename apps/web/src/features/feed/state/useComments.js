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
exports.useDeleteComment = exports.useGetCommentsByUserId = exports.useGetComments = exports.useUpdateComments = exports.useCreateComment = exports.commentKeys = void 0;
var react_query_1 = require("@tanstack/react-query");
var commentService_1 = require("@/features/feed/api/commentService");
var sonner_1 = require("sonner");
var usePosts_1 = require("./usePosts");
exports.commentKeys = {
    all: ["comments"],
    lists: function () { return __spreadArray(__spreadArray([], exports.commentKeys.all, true), ["list"], false); },
    listByPost: function (postId) {
        return __spreadArray(__spreadArray([], exports.commentKeys.lists(), true), ["post", postId], false);
    },
    listByUser: function (userId) {
        return __spreadArray(__spreadArray([], exports.commentKeys.lists(), true), ["user", userId], false);
    },
    listByComment: function (commentId) {
        return __spreadArray(__spreadArray([], exports.commentKeys.lists(), true), ["comment", commentId], false);
    },
};
var useCreateComment = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var data = _a.data, userId = _a.userId, postId = _a.postId;
            return (0, commentService_1.createCommentRequest)(data, userId, postId);
        },
        onSuccess: function (result, _a) {
            var postId = _a.postId, userId = _a.userId;
            if (result.success) {
                sonner_1.toast.success(result.message || "Comentário criado com sucesso!");
                queryClient.invalidateQueries({
                    queryKey: exports.commentKeys.listByPost(postId),
                });
                queryClient.invalidateQueries({
                    queryKey: exports.commentKeys.listByUser(userId),
                });
                queryClient.invalidateQueries({
                    queryKey: usePosts_1.postKeys.lists(),
                });
            }
            else {
                sonner_1.toast.error(result.message || "Erro ao criar comentário.");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao criar comentário.");
        },
    });
};
exports.useCreateComment = useCreateComment;
var useUpdateComments = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var data = _a.data, userId = _a.userId, commentId = _a.commentId;
            return (0, commentService_1.updateCommentRequest)(data, userId, commentId);
        },
        onSuccess: function (result, _a) {
            var userId = _a.userId, postId = _a.postId;
            if (result.success) {
                sonner_1.toast.success(result.message || "Comentário atualizado com sucesso!");
                queryClient.invalidateQueries({
                    queryKey: exports.commentKeys.listByPost(postId),
                });
                queryClient.invalidateQueries({
                    queryKey: exports.commentKeys.listByUser(userId),
                });
            }
            else {
                sonner_1.toast.error(result.message || "Erro ao atualizar comentário");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao atualizar postagem");
        },
    });
};
exports.useUpdateComments = useUpdateComments;
var useGetComments = function (postId) {
    return (0, react_query_1.useQuery)({
        queryKey: exports.commentKeys.listByPost(postId),
        queryFn: function () { return (0, commentService_1.getCommentsPostRequest)(postId); },
        staleTime: 5 * 60 * 1000,
        enabled: !!postId,
    });
};
exports.useGetComments = useGetComments;
var useGetCommentsByUserId = function (userId) {
    return (0, react_query_1.useQuery)({
        queryKey: exports.commentKeys.listByUser(userId),
        queryFn: function () { return (0, commentService_1.getCommentsUserId)(userId); },
        staleTime: 5 * 60 * 1000,
        enabled: !!userId,
    });
};
exports.useGetCommentsByUserId = useGetCommentsByUserId;
var useDeleteComment = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var userId = _a.userId, commentId = _a.commentId;
            return (0, commentService_1.deleteCommentRequest)(userId, commentId);
        },
        onSuccess: function (result, _a) {
            var postId = _a.postId, userId = _a.userId;
            if (result.success) {
                sonner_1.toast.success(result.message || "Comentário deletado com sucesso!");
                queryClient.invalidateQueries({
                    queryKey: exports.commentKeys.listByPost(postId),
                });
                queryClient.invalidateQueries({
                    queryKey: exports.commentKeys.listByUser(userId),
                });
            }
            else {
                sonner_1.toast.error(result.message || "Erro ao deletar comentário");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao deletar comentário");
        },
    });
};
exports.useDeleteComment = useDeleteComment;
