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
exports.useGetFollow = exports.useGetFollowing = exports.useGetFollowers = exports.useFollowAndUnfollow = exports.followKeys = void 0;
var react_query_1 = require("@tanstack/react-query");
var followerService_1 = require("@/features/profile/api/followerService");
var sonner_1 = require("sonner");
exports.followKeys = {
    all: ["follows"],
    lists: function () { return __spreadArray(__spreadArray([], exports.followKeys.all, true), ["list"], false); },
    followers: function (userId) {
        return __spreadArray(__spreadArray([], exports.followKeys.lists(), true), ["followers", userId], false);
    },
    following: function (userId) {
        return __spreadArray(__spreadArray([], exports.followKeys.lists(), true), ["following", userId], false);
    },
    detail: function (followerId, followedId) {
        return __spreadArray(__spreadArray([], exports.followKeys.all, true), ["detail", followerId, followedId], false);
    },
};
var useFollowAndUnfollow = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var followerId = _a.followerId, followedId = _a.followedId;
            return (0, followerService_1.followAndUnfollowRequest)({ followerId: followerId, followedId: followedId });
        },
        onSuccess: function (result, _a) {
            var followedId = _a.followedId, followerId = _a.followerId;
            if (result.success) {
                sonner_1.toast.success(result.message);
                queryClient.invalidateQueries({
                    queryKey: exports.followKeys.followers(followedId),
                });
                queryClient.invalidateQueries({
                    queryKey: exports.followKeys.following(followerId),
                });
                queryClient.invalidateQueries({
                    queryKey: exports.followKeys.detail(followerId, followedId),
                });
            }
            else {
                sonner_1.toast.error(result.error);
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro enquanto seguia ou deixava de seguir");
        },
    });
};
exports.useFollowAndUnfollow = useFollowAndUnfollow;
var useGetFollowers = function (userId) {
    return (0, react_query_1.useQuery)({
        queryKey: exports.followKeys.followers(userId),
        queryFn: function () { return (0, followerService_1.getFollowersRequest)({ id: userId }); },
        enabled: !!userId,
    });
};
exports.useGetFollowers = useGetFollowers;
var useGetFollowing = function (userId) {
    return (0, react_query_1.useQuery)({
        queryKey: exports.followKeys.following(userId),
        queryFn: function () { return (0, followerService_1.getFollowingRequest)({ id: userId }); },
        enabled: !!userId,
    });
};
exports.useGetFollowing = useGetFollowing;
var useGetFollow = function (followerId, followedId) {
    return (0, react_query_1.useQuery)({
        queryKey: exports.followKeys.detail(followerId, followedId),
        queryFn: function () { return (0, followerService_1.getFollowRequest)({ followerId: followerId, followedId: followedId }); },
        enabled: !isNaN(followerId) && !isNaN(followedId),
    });
};
exports.useGetFollow = useGetFollow;
