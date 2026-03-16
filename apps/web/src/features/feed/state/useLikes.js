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
exports.useCommentLikes = exports.useToggleLikeComment = exports.useToggleLike = exports.likeKeys = void 0;
var likeService_1 = require("@/features/feed/api/likeService");
var react_query_1 = require("@tanstack/react-query");
var usePosts_1 = require("./usePosts");
var sonner_1 = require("sonner");
var useComments_1 = require("./useComments");
exports.likeKeys = {
    all: ["likes"],
    lists: function () { return __spreadArray(__spreadArray([], exports.likeKeys.all, true), ["list"], false); },
    list: function (filters) { return __spreadArray(__spreadArray([], exports.likeKeys.lists(), true), [{ filters: filters }], false); },
    details: function () { return __spreadArray(__spreadArray([], exports.likeKeys.all, true), ["detail"], false); },
    detail: function (id) { return __spreadArray(__spreadArray([], exports.likeKeys.details(), true), [id], false); },
};
var useToggleLike = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (data) { return (0, likeService_1.toggleLikeRequest)(data); },
        onSuccess: function (result) {
            if (result.success) {
                sonner_1.toast.success(result.message || "Like atualizado com sucesso!");
                queryClient.invalidateQueries({ queryKey: usePosts_1.postKeys.lists() });
                queryClient.invalidateQueries({ queryKey: exports.likeKeys.lists() });
            }
            else {
                sonner_1.toast.error(result.error || "Erro ao atualizar like");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao atualizar like");
        },
    });
};
exports.useToggleLike = useToggleLike;
var useToggleLikeComment = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (data) { return (0, likeService_1.toggleLikeRequestComment)(data); },
        onSuccess: function (result, variables) {
            if (result.success) {
                sonner_1.toast.success(result.message || "Like atualizado com sucesso!");
                queryClient.invalidateQueries({ queryKey: useComments_1.commentKeys.all });
                queryClient.invalidateQueries({
                    queryKey: __spreadArray(__spreadArray([], exports.likeKeys.all, true), ["comment", variables.commentId], false),
                });
                queryClient.invalidateQueries({ queryKey: exports.likeKeys.lists() });
            }
            else {
                sonner_1.toast.error(result.error || "Erro ao atualizar like");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao atualizar like");
        },
    });
};
exports.useToggleLikeComment = useToggleLikeComment;
var useCommentLikes = function (commentId) {
    return (0, react_query_1.useQuery)({
        queryKey: __spreadArray(__spreadArray([], exports.likeKeys.all, true), ["comment", commentId], false),
        queryFn: function () { return (0, likeService_1.getCommentLikes)(commentId); },
        staleTime: 1000 * 10 * 1,
    });
};
exports.useCommentLikes = useCommentLikes;
