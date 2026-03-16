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
exports.useDeletePost = exports.useGetPosts = exports.useUpdatePost = exports.useCreatePost = exports.postKeys = void 0;
var postService_1 = require("@/features/feed/api/postService");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
exports.postKeys = {
    all: ["posts"],
    lists: function () { return __spreadArray(__spreadArray([], exports.postKeys.all, true), ["list"], false); },
    list: function (filters) { return __spreadArray(__spreadArray([], exports.postKeys.lists(), true), [{ filters: filters }], false); },
    details: function () { return __spreadArray(__spreadArray([], exports.postKeys.all, true), ["detail"], false); },
    detail: function (id) { return __spreadArray(__spreadArray([], exports.postKeys.details(), true), [id], false); },
};
var useCreatePost = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var data = _a.data, userId = _a.userId;
            return (0, postService_1.createPostRequest)(data, userId);
        },
        onSuccess: function (result) {
            if (result.success) {
                sonner_1.toast.success(result.message || "Publicação criada com sucesso!");
                queryClient.invalidateQueries({ queryKey: exports.postKeys.lists() });
            }
            else {
                sonner_1.toast.error(result.message || "Erro ao criar publicação");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao criar postagem");
        },
    });
};
exports.useCreatePost = useCreatePost;
var useUpdatePost = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var data = _a.data, userId = _a.userId, postId = _a.postId;
            return (0, postService_1.updatePostRequest)(data, userId, postId);
        },
        onSuccess: function (result) {
            if (result.success) {
                sonner_1.toast.success(result.message || "Publicação atualizada com sucesso!");
                queryClient.invalidateQueries({ queryKey: exports.postKeys.lists() });
            }
            else {
                sonner_1.toast.error(result.message || "Erro ao atualizar publicação");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao atualizar postagem");
        },
    });
};
exports.useUpdatePost = useUpdatePost;
var useGetPosts = function () {
    return (0, react_query_1.useQuery)({
        queryKey: exports.postKeys.lists(),
        queryFn: postService_1.getPostsRequest,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};
exports.useGetPosts = useGetPosts;
var useDeletePost = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var userId = _a.userId, postId = _a.postId;
            return (0, postService_1.deletePostRequest)(userId, postId);
        },
        onSuccess: function (result) {
            if (result.success) {
                sonner_1.toast.success(result.message || "Publicação deletada com sucesso!");
                queryClient.invalidateQueries({ queryKey: exports.postKeys.lists() });
            }
            else {
                sonner_1.toast.error(result.message || "Erro ao deletar publicação");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao deletar postagem");
        },
    });
};
exports.useDeletePost = useDeletePost;
