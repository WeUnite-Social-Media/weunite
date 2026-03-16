"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFollowAction = void 0;
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var useUserProfile_1 = require("./useUserProfile");
var useFollow_1 = require("@/features/profile/state/useFollow");
var react_1 = require("react");
var useFollowAction = function (profileUsername) {
    var _a;
    var authUser = (0, useAuthStore_1.useAuthStore)().user;
    var _b = (0, useUserProfile_1.useUserProfile)(profileUsername), profileUser = _b.data, isProfileLoading = _b.isLoading;
    var followerId = authUser === null || authUser === void 0 ? void 0 : authUser.id;
    var followedId = profileUser === null || profileUser === void 0 ? void 0 : profileUser.id;
    var _c = (0, useFollow_1.useGetFollow)(Number(followerId), Number(followedId)), followStatusResponse = _c.data, isFollowStatusLoading = _c.isLoading;
    var _d = (0, useFollow_1.useFollowAndUnfollow)(), follow = _d.mutate, isFollowingMutation = _d.isPending;
    var initialIsFollowing = (followStatusResponse === null || followStatusResponse === void 0 ? void 0 : followStatusResponse.success) === true &&
        ((_a = followStatusResponse.data) === null || _a === void 0 ? void 0 : _a.status) === "ACCEPTED";
    var _e = (0, react_1.useState)(initialIsFollowing), isFollowing = _e[0], setIsFollowing = _e[1];
    (0, react_1.useEffect)(function () {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);
    var handleFollow = function () {
        if (followerId && followedId) {
            setIsFollowing(function (prev) { return !prev; });
            follow({
                followerId: Number(followerId),
                followedId: Number(followedId),
            });
        }
    };
    return {
        isFollowing: isFollowing,
        handleFollow: handleFollow,
        isLoading: isProfileLoading || isFollowStatusLoading || isFollowingMutation,
    };
};
exports.useFollowAction = useFollowAction;
