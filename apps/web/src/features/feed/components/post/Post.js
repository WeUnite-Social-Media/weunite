"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Post;
var card_1 = require("@/shared/components/ui/card");
var avatar_1 = require("@/shared/components/ui/avatar");
var dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var alert_dialog_1 = require("@/shared/components/ui/alert-dialog");
var useGetTimeAgo_1 = require("@/shared/hooks/useGetTimeAgo");
var useLikes_1 = require("@/features/feed/state/useLikes");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var react_1 = require("react");
var EditPost_1 = require("./EditPost");
var usePosts_1 = require("@/features/feed/state/usePosts");
var alert_dialog_2 = require("@/shared/components/ui/alert-dialog");
var Comments_1 = require("./Comments/Comments");
var getInitials_1 = require("@/shared/utils/getInitials");
var react_router_dom_1 = require("react-router-dom");
var ReportModal_1 = require("@/features/reporting/components/ReportModal");
var actions = [{ icon: lucide_react_1.Heart }, { icon: lucide_react_1.MessageCircle }, { icon: lucide_react_1.Repeat2 }];
function Post(_a) {
    var post = _a.post;
    var initials = (0, getInitials_1.getInitials)(post.user.name);
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var toggleLike = (0, useLikes_1.useToggleLike)();
    var deletePost = (0, usePosts_1.useDeletePost)();
    var isLiked = post.likes.some(function (like) { return like.user.id === (user === null || user === void 0 ? void 0 : user.id); });
    var _b = (0, react_1.useState)(false), isEditPostOpen = _b[0], setIsEditPostOpen = _b[1];
    var _c = (0, react_1.useState)(false), isDeleteDialogOpen = _c[0], setIsDeleteDialogOpen = _c[1];
    var _d = (0, react_1.useState)(false), isCommentsOpen = _d[0], setIsCommentsOpen = _d[1];
    var _e = (0, react_1.useState)(false), isReportModalOpen = _e[0], setIsReportModalOpen = _e[1];
    var handleLikeClick = function () {
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return;
        toggleLike.mutate({ postId: post.id, userId: user.id, commentId: "" });
    };
    var isOwner = post.user.id === (user === null || user === void 0 ? void 0 : user.id);
    var handleEditPostOpen = function () {
        setIsEditPostOpen(true);
    };
    var handleDelete = function () {
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return;
        deletePost.mutate({
            userId: Number(user.id),
            postId: Number(post.id),
        });
        setIsDeleteDialogOpen(false);
    };
    var handleCommentsOpen = function () {
        setIsCommentsOpen(true);
    };
    var handleReportClick = function () {
        setIsReportModalOpen(true);
    };
    var navigate = (0, react_router_dom_1.useNavigate)();
    var handleProfileClick = function () {
        if (isOwner) {
            navigate("/profile");
        }
        else {
            navigate("/profile/".concat(post.user.username));
        }
    };
    return (<>
      <Comments_1.default isOpen={isCommentsOpen} onOpenChange={setIsCommentsOpen} post={post}/>

      <EditPost_1.EditPost open={isEditPostOpen} onOpenChange={setIsEditPostOpen} post={post}/>

      <ReportModal_1.ReportModal isOpen={isReportModalOpen} onOpenChange={setIsReportModalOpen} entityType="POST" entityId={Number(post.id)} entityTitle={post.text.substring(0, 50) + (post.text.length > 50 ? "..." : "")}/>

      <card_1.Card className="w-full max-w-[45em] bg-red shadow-none border-0 border-b rounded-none border-foreground/50">
        <card_1.CardHeader className="flex flex-row items-center gap-2 mb-[0.5em]">
          <avatar_1.Avatar className="hover:cursor-pointer h-[2.8em] w-[2.8em]" onClick={handleProfileClick}>
            <avatar_1.AvatarImage src={post.user.profileImg} alt="profile image"/>
            <avatar_1.AvatarFallback>{initials}</avatar_1.AvatarFallback>
          </avatar_1.Avatar>

          <div className="flex flex-col">
            <card_1.CardTitle className="text-base font-medium hover:cursor-pointer" onClick={handleProfileClick}>
              {post.user.username}
            </card_1.CardTitle>

            <card_1.CardDescription className="text-xs">
              Publicado há {(0, useGetTimeAgo_1.getTimeAgo)(post.createdAt)}
            </card_1.CardDescription>
          </div>

          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <lucide_react_1.EllipsisVertical className="ml-auto h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors"/>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end" className="w-48">
              {isOwner ? (<>
                  <dropdown_menu_1.DropdownMenuItem onClick={handleEditPostOpen} className=" hover:cursor-pointer">
                    <lucide_react_1.Edit className="mr-2 h-4 w-4"/>
                    Editar
                  </dropdown_menu_1.DropdownMenuItem>

                  <alert_dialog_1.AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <alert_dialog_1.AlertDialogTrigger asChild>
                      <dropdown_menu_1.DropdownMenuItem className="hover:cursor-pointer" onSelect={function (e) {
                e.preventDefault();
                setIsDeleteDialogOpen(true);
            }}>
                        <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
                        Excluir
                      </dropdown_menu_1.DropdownMenuItem>
                    </alert_dialog_1.AlertDialogTrigger>
                    <alert_dialog_1.AlertDialogContent>
                      <alert_dialog_2.AlertDialogHeader>
                        <alert_dialog_1.AlertDialogTitle>Tem certeza?</alert_dialog_1.AlertDialogTitle>
                        <alert_dialog_1.AlertDialogDescription>
                          Esta ação não pode ser desfeita. O post será
                          permanentemente removido da plataforma.
                        </alert_dialog_1.AlertDialogDescription>
                      </alert_dialog_2.AlertDialogHeader>
                      <alert_dialog_2.AlertDialogFooter>
                        <alert_dialog_1.AlertDialogCancel className="hover:cursor-pointer">
                          Cancelar
                        </alert_dialog_1.AlertDialogCancel>
                        <alert_dialog_1.AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-zinc-100 hover:cursor-pointer" disabled={deletePost.isPending}>
                          {deletePost.isPending ? "Deletando..." : "Excluir"}
                        </alert_dialog_1.AlertDialogAction>
                      </alert_dialog_2.AlertDialogFooter>
                    </alert_dialog_1.AlertDialogContent>
                  </alert_dialog_1.AlertDialog>

                  <dropdown_menu_1.DropdownMenuSeparator />
                  <dropdown_menu_1.DropdownMenuItem className=" hover:cursor-pointer">
                    <lucide_react_1.Share className="mr-2 h-4 w-4"/>
                    Compartilhar
                  </dropdown_menu_1.DropdownMenuItem>
                </>) : (<>
                  <dropdown_menu_1.DropdownMenuItem className="hover:cursor-pointer">
                    <lucide_react_1.Share className="mr-2 h-4 w-4"/>
                    Compartilhar
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuSeparator />
                  <dropdown_menu_1.DropdownMenuItem className="text-red-600 hover:cursor-pointer" onClick={handleReportClick}>
                    <lucide_react_1.Flag className="mr-2 h-4 w-4"/>
                    Denunciar
                  </dropdown_menu_1.DropdownMenuItem>
                </>)}
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </card_1.CardHeader>

        <card_1.CardContent className="w-full mt-[-18px]">
          <div className="w-full flex justify-center items-center">
            {post.imageUrl && (<img src={post.imageUrl} alt="Post media" className="rounded-sm mb-2"/>)}
          </div>

          <p className="">{post.text}</p>
        </card_1.CardContent>

        <card_1.CardFooter className="flex flex-col mt-[-20px]">
          <div className="flex justify-between w-full mb-3">
            <span className="text-sm text-muted-foreground">
              {post.likes.length || 0} curtidas • {post.comments.length || 0}{" "}
              comentários
            </span>
          </div>

          <div className="flex w-full justify-between">
            <card_1.CardAction className="flex items-center gap-3 hover:cursor-pointer">
              {actions.map(function (action, index) { return (<div key={index} onClick={function (e) {
                e.preventDefault();
                if (action.icon === lucide_react_1.Heart) {
                    handleLikeClick();
                }
                else if (action.icon === lucide_react_1.MessageCircle) {
                    handleCommentsOpen();
                }
            }}>
                  <action.icon className={"h-5 w-5 transition-colors  ".concat(index === 0 && isLiked
                ? "text-red-500 fill-red-500"
                : "text-muted-foreground")}/>
                </div>); })}
            </card_1.CardAction>

            <card_1.CardAction className="flex items-right gap-2 hover:cursor-pointer">
              <div>
                <lucide_react_1.Bookmark className="h-5 w-5 text-muted-foreground varient-ghost"/>
              </div>
            </card_1.CardAction>
          </div>
        </card_1.CardFooter>
      </card_1.Card>
    </>);
}
