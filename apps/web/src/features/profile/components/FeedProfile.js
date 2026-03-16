"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FeedProfile;
var react_1 = require("react");
var Post_1 = require("@/features/feed/components/post/Post");
var Comment_1 = require("@/features/feed/components/post/Comments/Comment");
var usePosts_1 = require("@/features/feed/state/usePosts");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var useComments_1 = require("@/features/feed/state/useComments");
var AboutProfile_1 = require("./AboutProfile");
var useUserProfile_1 = require("@/features/profile/hooks/useUserProfile");
function FeedProfile(_a) {
    var profileUsername = _a.profileUsername;
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var profileUser = (0, useUserProfile_1.useUserProfile)(profileUsername).data;
    var isOwnProfile = !profileUsername || profileUsername === (user === null || user === void 0 ? void 0 : user.username);
    var displayUser = isOwnProfile ? user : profileUser;
    var data = (0, usePosts_1.useGetPosts)().data;
    var dataComments = (0, useComments_1.useGetCommentsByUserId)((displayUser === null || displayUser === void 0 ? void 0 : displayUser.id) ? Number(displayUser.id) : 0).data;
    var _b = (0, react_1.useState)("publicacoes"), activeTab = _b[0], setActiveTab = _b[1];
    var posts = (data === null || data === void 0 ? void 0 : data.data) || [];
    var comments = (dataComments === null || dataComments === void 0 ? void 0 : dataComments.data) || [];
    var userPosts = posts.filter(function (post) { var _a; return ((_a = post.user) === null || _a === void 0 ? void 0 : _a.id) === (displayUser === null || displayUser === void 0 ? void 0 : displayUser.id); }) || [];
    var userComments = comments.filter(function (comment) { var _a; return ((_a = comment.user) === null || _a === void 0 ? void 0 : _a.id) === (displayUser === null || displayUser === void 0 ? void 0 : displayUser.id); }) || [];
    return (<div className="max-w-2xl xl:w-[48em] mx-auto">
      <div className="flex border-b border-primary justify-center">
        <div className={"w-full justify-center flex cursor-pointer py-2 ".concat(activeTab === "publicacoes" ? "border-b-2 border-primary" : "")} onClick={function () { return setActiveTab("publicacoes"); }}>
          <p className="">Publicações</p>
        </div>

        <div className={"w-full justify-center flex cursor-pointer py-2 ".concat(activeTab === "comentarios" ? "border-b-2 border-primary" : "")} onClick={function () { return setActiveTab("comentarios"); }}>
          <p className="">Comentários</p>
        </div>

        <div className={"w-full justify-center flex cursor-pointer py-2 ".concat(activeTab === "Sobre" ? "border-b-2 border-primary" : "")} onClick={function () { return setActiveTab("Sobre"); }}>
          <p className="">Sobre</p>
        </div>
      </div>

      {activeTab === "publicacoes" && (<div className="flex flex-col items-center justify-center">
          {userPosts.length > 0 ? (userPosts.map(function (post) { return (<Post_1.default key={post.id} post={post}/>); })) : (<p className="text-gray-500 mt-8">Nenhuma publicação encontrada</p>)}
        </div>)}

      {activeTab === "comentarios" && (<div className="flex flex-col items-center justify-center">
          {userComments.length > 0 ? (userComments.map(function (comment) { return (<Comment_1.default key={comment.id} comment={comment}/>); })) : (<p className="text-gray-500 mt-8">Nenhum comentário encontrado</p>)}
        </div>)}

      {activeTab === "Sobre" && (<div className="flex flex-col items-center justify-center mt-3">
          <AboutProfile_1.default />
        </div>)}
    </div>);
}
