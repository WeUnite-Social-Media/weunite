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
exports.useDeleteProfileBanner = exports.useUpdateProfile = exports.profileKeys = void 0;
var userService_1 = require("@/features/profile/api/userService");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var usePosts_1 = require("@/features/feed/state/usePosts");
var useComments_1 = require("@/features/feed/state/useComments");
exports.profileKeys = {
    all: ["profiles"],
    lists: function () { return __spreadArray(__spreadArray([], exports.profileKeys.all, true), ["list"], false); },
    listByUser: function (userId) { return __spreadArray(__spreadArray([], exports.profileKeys.lists(), true), [{ userId: userId }], false); },
    listByPostId: function (postId) {
        return __spreadArray(__spreadArray([], exports.profileKeys.lists(), true), [{ postId: postId }], false);
    },
    detailByUsername: function (username) {
        return __spreadArray(__spreadArray([], exports.profileKeys.all, true), ["detail", username], false);
    },
};
var useUpdateProfile = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    var _a = (0, useAuthStore_1.useAuthStore)(), user = _a.user, setUser = _a.setUser;
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var data = _a.data, username = _a.username;
            return (0, userService_1.updateUser)(data, username);
        },
        onSuccess: function (result) {
            var _a;
            if (result.success) {
                sonner_1.toast.success(result.message || "Perfil atualizado com sucesso!");
                if (user && ((_a = result.data) === null || _a === void 0 ? void 0 : _a.data)) {
                    setUser(__assign(__assign({}, user), { name: result.data.data.name || user.name, username: result.data.data.username || user.username, profileImg: result.data.data.profileImg || user.profileImg, bannerImg: result.data.data.bannerImg || user.bannerImg }));
                }
                queryClient.invalidateQueries({
                    queryKey: ["user-profile", user === null || user === void 0 ? void 0 : user.username],
                });
                queryClient.invalidateQueries({
                    queryKey: exports.profileKeys.listByUser(result.data.data.userId),
                });
                queryClient.invalidateQueries({ queryKey: usePosts_1.postKeys.lists() });
                queryClient.invalidateQueries({ queryKey: useComments_1.commentKeys.lists() });
            }
            else {
                sonner_1.toast.error((result === null || result === void 0 ? void 0 : result.error) || "Erro ao atualizar perfil");
            }
        },
        onError: function (error) {
            var _a, _b;
            var err = error;
            var errorMessage = ((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro inesperado ao atualizar perfil";
            sonner_1.toast.error(errorMessage);
        },
    });
};
exports.useUpdateProfile = useUpdateProfile;
var useDeleteProfileBanner = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    var _a = (0, useAuthStore_1.useAuthStore)(), user = _a.user, setUser = _a.setUser;
    return (0, react_query_1.useMutation)({
        mutationFn: function (username) { return (0, userService_1.deleteBannerUser)(username); },
        onSuccess: function (result) {
            var _a, _b;
            if (result.success) {
                sonner_1.toast.success(result.message || "Banner deletado com sucesso!");
                if (user && ((_a = result.data) === null || _a === void 0 ? void 0 : _a.data)) {
                    setUser(__assign(__assign({}, user), { bannerImg: (_b = result.data.bannerImg) !== null && _b !== void 0 ? _b : null }));
                }
                queryClient.invalidateQueries({
                    queryKey: ["user-profile", user === null || user === void 0 ? void 0 : user.username],
                });
            }
            else {
                sonner_1.toast.error((result === null || result === void 0 ? void 0 : result.error) || "Erro ao deletar banner");
            }
        },
        onError: function (error) {
            var _a, _b;
            var err = error;
            var errorMessage = ((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro inesperado ao deletar banner";
            sonner_1.toast.error(errorMessage);
        },
    });
};
exports.useDeleteProfileBanner = useDeleteProfileBanner;
