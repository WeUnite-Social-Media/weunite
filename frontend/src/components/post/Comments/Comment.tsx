import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  Repeat2,
  MessageCircle,
  Bookmark,
  EllipsisVertical,
  Trash2,
  Share,
  Edit,
  Flag,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { getTimeAgo } from "@/hooks/useGetTimeAgo";
import { useAuthStore } from "@/stores/useAuthStore";
import { AlertDialogFooter, AlertDialogHeader } from "../../ui/alert-dialog";
import type { Comment } from "@/@types/comment.types";
import { EditComment } from "@/components/post/Comments/EditComment";
import { useState } from "react";
import { useDeleteComment } from "@/state/useComments";
import { getInitials } from "@/utils/getInitials";
import { useToggleLikeComment, useCommentLikes } from "@/state/useLikes";
import { useEffect } from "react";

const actions = [{ icon: Heart }, { icon: MessageCircle }, { icon: Repeat2 }];

export default function Comment({ comment }: { comment: Comment }) {
  const { user } = useAuthStore();
  const initials = getInitials(comment.user.name);

  const [isEditCommentOpen, setIsEditCommentOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  type LikeUser = { user: { id: string | number } };
  const { data: likesData } = useCommentLikes(Number(comment.id));
  const serverLikes: LikeUser[] = likesData?.success
    ? (likesData.data as LikeUser[])
    : [];

  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);
  const [isLikedState, setIsLikedState] = useState(
    (comment.likes || []).some((like) => like.user.id === user?.id),
  );

  useEffect(() => {
    if (serverLikes.length > 0 || likesData?.success) {
      setLikesCount(serverLikes.length);
      setIsLikedState(serverLikes.some((like) => like.user.id === user?.id));
    }
  }, [serverLikes, user?.id, likesData]);

  const deleteComment = useDeleteComment();

  const toggleLike = useToggleLikeComment();

  const isOwner = comment.user.id === user?.id;

  const handleLikeClick = () => {
    if (!user?.id) return;

    setIsLikedState(!isLikedState);
    setLikesCount(isLikedState ? likesCount - 1 : likesCount + 1);

    toggleLike.mutate({
      userId: user.id,
      commentId: comment.id,
    });
  };

  const handleEditCommentOpen = () => {
    setIsEditCommentOpen(true);
  };

  const handleDelete = () => {
    if (!user?.id) return;

    deleteComment.mutate({
      userId: Number(user.id),
      commentId: Number(comment.id),
      postId: Number(comment.post.id),
    });

    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <EditComment
        open={isEditCommentOpen}
        onOpenChange={setIsEditCommentOpen}
        comment={comment}
      />

      <Card className="w-full max-w-[45em] bg-red shadow-none border-0 border-b rounded-none border-foreground/30">
        <CardHeader className="flex flex-row items-center gap-2 mb-[0.5em]">
          <Avatar className="hover:cursor-pointer h-[2.8em] w-[2.8em]">
            <AvatarImage src={user?.profileImg} alt="profile image" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle className="text-base font-medium hover:cursor-pointer">
              {comment.user.username}
            </CardTitle>

            <CardDescription className="text-xs">
              Publicado há {getTimeAgo(comment.createdAt)}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <EllipsisVertical className="ml-auto h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isOwner ? (
                <>
                  <DropdownMenuItem
                    onClick={handleEditCommentOpen}
                    className=" hover:cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>

                  <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="hover:cursor-pointer"
                        onSelect={(e) => {
                          e.preventDefault();
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O post será
                          permanentemente removido da plataforma.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="hover:cursor-pointer">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 text-zinc-100 hover:cursor-pointer"
                          disabled={deleteComment.isPending}
                        >
                          {deleteComment.isPending ? "Deletando..." : "Excluir"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className=" hover:cursor-pointer">
                    <Share className="mr-2 h-4 w-4" />
                    Compartilhar
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="hover:cursor-pointer">
                    <Share className="mr-2 h-4 w-4" />
                    Compartilhar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 hover:cursor-pointer">
                    <Flag className="mr-2 h-4 w-4" />
                    Denunciar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="mt-[-18px]">
          <p className="">{comment.text}</p>
        </CardContent>

        <CardFooter className="flex flex-col mt-[-20px]">
          <div className="flex justify-between w-full mb-3">
            <span className="text-sm text-muted-foreground">
              {likesCount} curtidas • {comment.comments.length || 0} comentários
            </span>
          </div>

          <div className="flex w-full justify-between">
            <CardAction className="flex items-center gap-3 hover:cursor-pointer">
              {actions.map((action, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    if (action.icon === Heart) {
                      handleLikeClick();
                    }
                  }}
                >
                  <action.icon
                    className={`h-5 w-5 transition-colors  ${
                      index === 0 && isLikedState
                        ? "text-red-500 fill-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
              ))}
            </CardAction>

            <CardAction className="flex items-right gap-2 hover:cursor-pointer">
              <div>
                <Bookmark className="h-5 w-5 text-muted-foreground varient-ghost" />
              </div>
            </CardAction>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
