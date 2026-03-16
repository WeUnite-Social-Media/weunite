"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Comments;
var drawer_1 = require("@/shared/components/ui/drawer");
var button_1 = require("@/shared/components/ui/button");
var lucide_react_1 = require("lucide-react");
var Post_1 = require("../Post");
var Comment_1 = require("./Comment");
var avatar_1 = require("@/shared/components/ui/avatar");
var textarea_1 = require("@/shared/components/ui/textarea");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
var dialog_1 = require("@/shared/components/ui/dialog");
var useComments_1 = require("@/features/feed/state/useComments");
var react_1 = require("react");
var getInitials_1 = require("@/shared/utils/getInitials");
function Comments(_a) {
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, post = _a.post;
    var _b = (0, react_1.useState)(""), commentText = _b[0], setCommentText = _b[1];
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var initials = (0, getInitials_1.getInitials)(user === null || user === void 0 ? void 0 : user.name);
    var commentDesktop = (0, useBreakpoints_1.useBreakpoints)().commentDesktop;
    var data = (0, useComments_1.useGetComments)(Number(post.id)).data;
    var comments = data === null || data === void 0 ? void 0 : data.data;
    var createCommentMutation = (0, useComments_1.useCreateComment)().mutate;
    var max_chars = 500;
    function handleCreateComment() {
        if (!user || !commentText.trim())
            return;
        createCommentMutation({
            data: { text: commentText, image: null },
            userId: Number(user.id),
            postId: Number(post.id),
        }, {
            onSuccess: function (result) {
                if (result.success) {
                    setCommentText("");
                }
            },
        });
    }
    if (!commentDesktop) {
        return (<drawer_1.Drawer open={isOpen} onOpenChange={onOpenChange}>
        <drawer_1.DrawerContent className="h-[100vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh] mt-0 flex flex-col">
          <drawer_1.DrawerHeader className="pt-4 px-6 flex-shrink-0">
            <drawer_1.DrawerClose className="absolute rounded-sm transition-opacity right-4">
              <lucide_react_1.X className="h-5 w-5 hover:cursor-pointer"/>
            </drawer_1.DrawerClose>
            <drawer_1.DrawerTitle>Comentários</drawer_1.DrawerTitle>
          </drawer_1.DrawerHeader>

          <div className="flex flex-col w-full items-center overflow-y-auto scrollbar-thumb">
            <Post_1.default post={post}/>

            <div className="w-full max-w-[45em] border-y border-foreground/30 px-4 py-3 flex gap-4">
              <avatar_1.Avatar>
                <avatar_1.AvatarImage src={user === null || user === void 0 ? void 0 : user.profileImg}/>
                <avatar_1.AvatarFallback>{initials}</avatar_1.AvatarFallback>
              </avatar_1.Avatar>

              <div className="w-full max-w-full min-w-0">
                <p className="text-sm text-muted-foreground mb-1">
                  Respondendo a{" "}
                  <span className="text-sky-500 hover:cursor-pointer">
                    @{post.user.username}
                  </span>
                </p>
                <textarea_1.Textarea placeholder="Poste sua resposta" className="bg-transparent border-none resize-none w-full min-h-[8vh] max-h-[11vh] overflow-y-auto custom-scrollbar focus-visible:ring-2 p-2 text-base break-all" value={commentText} onChange={function (e) { return setCommentText(e.target.value); }}/>

                <div className="flex justify-end items-center gap-2 mt-3">
                  <span className={"text-xs font-medium text-muted-foreground ".concat(commentText.length > max_chars ? "text-red-500" : "")}>
                    {commentText.length}/{max_chars}
                  </span>

                  <button_1.Button size="sm" variant="third" className="bg-third hover:bg-third-hover text-foreground rounded-full w-[7em]" onClick={handleCreateComment} disabled={!commentText.trim() || commentText.length > max_chars}>
                    Publicar
                  </button_1.Button>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[45em] p-2">
              {comments === null || comments === void 0 ? void 0 : comments.map(function (comment) { return (<Comment_1.default key={comment.id} comment={comment}/>); })}
            </div>
          </div>
        </drawer_1.DrawerContent>
      </drawer_1.Drawer>);
    }
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className={"".concat(post.imageUrl ? "max-w-6xl" : "max-w-3xl", " w-[90vw] h-[90vh] p-0 rounded-xl overflow-hidden")}>
        <drawer_1.DrawerClose className="absolute rounded-sm transition-opacity right-4 top-4 z-10">
          <lucide_react_1.X className="h-5 w-5 hover:cursor-pointer"/>
        </drawer_1.DrawerClose>

        <div className="flex w-full h-full">
          {post.imageUrl && (<div className="w-1/2 h-full flex items-center justify-center bg-black">
              <img src={post.imageUrl} alt="Post" className="object-cover w-full h-full"/>
            </div>)}

          <div className={"".concat(post.imageUrl ? "w-1/2" : "w-full", " flex flex-col")}>
            <div className="p-4 border-b flex gap-2 bg-card z-2">
              <avatar_1.Avatar>
                <avatar_1.AvatarImage src={post.user.profileImg}/>
                <avatar_1.AvatarFallback>{initials}</avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div className="flex flex-col">
                <span className="font-semibold">{post.user.username}</span>
                <p className="text-sm text-muted-foreground">{post.text}</p>
              </div>
            </div>

            <div className="flex-1 max-h-[66vh] overflow-y-auto -mt-5 p-4 custom-scrollbar">
              <div className="space-y-4">
                {comments === null || comments === void 0 ? void 0 : comments.map(function (comment) { return (<Comment_1.default key={comment.id} comment={comment}/>); })}
              </div>
            </div>

            <div className="border-t border-foreground/30 px-4 py-3">
              <div className="flex gap-3">
                <avatar_1.Avatar className="w-8 h-8">
                  <avatar_1.AvatarImage src={user === null || user === void 0 ? void 0 : user.profileImg}/>
                  <avatar_1.AvatarFallback className="text-xs">
                    {user === null || user === void 0 ? void 0 : user.name.substring(0, 2).toUpperCase()}
                  </avatar_1.AvatarFallback>
                </avatar_1.Avatar>

                <div className="flex-1 min-w-0">
                  <textarea_1.Textarea placeholder="Poste sua resposta" className="bg-transparent border-none resize-none w-full min-h-[8vh] max-h-[8vh] overflow-y-auto custom-scrollbar focus-visible:ring-2 p-2 text-base break-all" value={commentText} onChange={function (e) { return setCommentText(e.target.value); }}/>

                  <div className="flex justify-end items-center gap-2 mt-3">
                    <span className={"text-xs font-medium text-muted-foreground ".concat(commentText.length > max_chars ? "text-red-500" : "")}>
                      {commentText.length}/{max_chars}
                    </span>

                    <button_1.Button size="sm" variant="third" className="bg-third hover:bg-third-hover rounded-full w-[7em] text-background" onClick={handleCreateComment} disabled={!commentText.trim() || commentText.length > max_chars}>
                      Publicar
                    </button_1.Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
