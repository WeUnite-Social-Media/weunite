"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Comment;
var card_1 = require("@/shared/components/ui/card");
var avatar_1 = require("@/shared/components/ui/avatar");
var dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var alert_dialog_1 = require("@/shared/components/ui/alert-dialog");
var useGetTimeAgo_1 = require("@/shared/hooks/useGetTimeAgo");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var alert_dialog_2 = require("@/shared/components/ui/alert-dialog");
var EditComment_1 = require("@/features/feed/components/post/Comments/EditComment");
var react_1 = require("react");
var useComments_1 = require("@/features/feed/state/useComments");
var getInitials_1 = require("@/shared/utils/getInitials");
var useLikes_1 = require("@/features/feed/state/useLikes");
var react_2 = require("react");
var actions = [{ icon: lucide_react_1.Heart }, { icon: lucide_react_1.MessageCircle }, { icon: lucide_react_1.Repeat2 }];
function Comment(_a) {
    var _b;
    var comment = _a.comment;
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var initials = (0, getInitials_1.getInitials)(comment.user.name);
    var _c = (0, react_1.useState)(false), isEditCommentOpen = _c[0], setIsEditCommentOpen = _c[1];
    var _d = (0, react_1.useState)(false), isDeleteDialogOpen = _d[0], setIsDeleteDialogOpen = _d[1];
    var likesData = (0, useLikes_1.useCommentLikes)(Number(comment.id)).data;
    var serverLikes = (likesData === null || likesData === void 0 ? void 0 : likesData.success)
        ? likesData.data
        : [];
    var _e = (0, react_1.useState)(((_b = comment.likes) === null || _b === void 0 ? void 0 : _b.length) || 0), likesCount = _e[0], setLikesCount = _e[1];
    var _f = (0, react_1.useState)((comment.likes || []).some(function (like) { return like.user.id === (user === null || user === void 0 ? void 0 : user.id); })), isLikedState = _f[0], setIsLikedState = _f[1];
    (0, react_2.useEffect)(function () {
        if (serverLikes.length > 0 || (likesData === null || likesData === void 0 ? void 0 : likesData.success)) {
            setLikesCount(serverLikes.length);
            setIsLikedState(serverLikes.some(function (like) { return like.user.id === (user === null || user === void 0 ? void 0 : user.id); }));
        }
    }, [serverLikes, user === null || user === void 0 ? void 0 : user.id, likesData]);
    var deleteComment = (0, useComments_1.useDeleteComment)();
    var toggleLike = (0, useLikes_1.useToggleLikeComment)();
    var isOwner = comment.user.id === (user === null || user === void 0 ? void 0 : user.id);
    var handleLikeClick = function () {
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return;
        setIsLikedState(!isLikedState);
        setLikesCount(isLikedState ? likesCount - 1 : likesCount + 1);
        toggleLike.mutate({
            userId: user.id,
            commentId: comment.id,
        });
    };
    var handleEditCommentOpen = function () {
        setIsEditCommentOpen(true);
    };
    var handleDelete = function () {
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return;
        deleteComment.mutate({
            userId: Number(user.id),
            commentId: Number(comment.id),
            postId: Number(comment.post.id),
        });
        setIsDeleteDialogOpen(false);
    };
    return (<>
      <EditComment_1.EditComment open={isEditCommentOpen} onOpenChange={setIsEditCommentOpen} comment={comment}/>

      <card_1.Card className="w-full max-w-[45em] bg-red shadow-none border-0 border-b rounded-none border-foreground/30">
        <card_1.CardHeader className="flex flex-row items-center gap-2 mb-[0.5em]">
          <avatar_1.Avatar className="hover:cursor-pointer h-[2.8em] w-[2.8em]">
            <avatar_1.AvatarImage src={user === null || user === void 0 ? void 0 : user.profileImg} alt="profile image"/>
            <avatar_1.AvatarFallback>{initials}</avatar_1.AvatarFallback>
          </avatar_1.Avatar>

          <div className="flex flex-col">
            <card_1.CardTitle className="text-base font-medium hover:cursor-pointer">
              {comment.user.username}
            </card_1.CardTitle>

            <card_1.CardDescription className="text-xs">
              Publicado há {(0, useGetTimeAgo_1.getTimeAgo)(comment.createdAt)}
            </card_1.CardDescription>
          </div>

          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <lucide_react_1.EllipsisVertical className="ml-auto h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors"/>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end" className="w-48">
              {isOwner ? (<>
                  <dropdown_menu_1.DropdownMenuItem onClick={handleEditCommentOpen} className=" hover:cursor-pointer">
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
                        <alert_dialog_1.AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-zinc-100 hover:cursor-pointer" disabled={deleteComment.isPending}>
                          {deleteComment.isPending ? "Deletando..." : "Excluir"}
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
                  <dropdown_menu_1.DropdownMenuItem className="text-red-600 hover:cursor-pointer">
                    <lucide_react_1.Flag className="mr-2 h-4 w-4"/>
                    Denunciar
                  </dropdown_menu_1.DropdownMenuItem>
                </>)}
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </card_1.CardHeader>

        <card_1.CardContent className="mt-[-18px]">
          <p className="">{comment.text}</p>
        </card_1.CardContent>

        <card_1.CardFooter className="flex flex-col mt-[-20px]">
          <div className="flex justify-between w-full mb-3">
            <span className="text-sm text-muted-foreground">
              {likesCount} curtidas • {comment.comments.length || 0} comentários
            </span>
          </div>

          <div className="flex w-full justify-between">
            <card_1.CardAction className="flex items-center gap-3 hover:cursor-pointer">
              {actions.map(function (action, index) { return (<div key={index} onClick={function (e) {
                e.preventDefault();
                if (action.icon === lucide_react_1.Heart) {
                    handleLikeClick();
                }
            }}>
                  <action.icon className={"h-5 w-5 transition-colors  ".concat(index === 0 && isLikedState
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
