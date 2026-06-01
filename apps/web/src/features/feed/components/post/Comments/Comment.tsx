import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Bookmark,
  Edit,
  EllipsisVertical,
  Flag,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { EditComment } from "@/features/feed/components/post/Comments/EditComment";
import { useDeleteComment } from "@/features/feed/state/useComments";
import {
  useCommentLikes,
  useToggleLikeComment,
} from "@/features/feed/state/useLikes";
import { ReportModal } from "@/features/reporting/components/ReportModal";
import { getTimeAgo } from "@/shared/hooks/useGetTimeAgo";
import type { Comment } from "@/shared/types/comment.types";
import { getInitials } from "@/shared/utils/getInitials";

const actions = [{ icon: Heart }, { icon: MessageCircle }, { icon: Repeat2 }];

const sameId = (
  left?: string | number | null,
  right?: string | number | null,
) => String(left ?? "") === String(right ?? "");

export default function Comment({ comment }: { comment: Comment }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const initials = getInitials(comment.user.name);

  const [isEditCommentOpen, setIsEditCommentOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  type LikeUser = { user: { id: string | number } };

  const { data: likesData } = useCommentLikes(Number(comment.id));

  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);
  const [isLikedState, setIsLikedState] = useState(
    (comment.likes || []).some((like) => sameId(like.user.id, user?.id)),
  );

  useEffect(() => {
    const serverLikes: LikeUser[] = likesData?.success
      ? (likesData.data as LikeUser[])
      : [];

    if (serverLikes.length > 0 || likesData?.success) {
      setLikesCount(serverLikes.length);
      setIsLikedState(
        serverLikes.some((like) => sameId(like.user.id, user?.id)),
      );
    }
  }, [likesData, user?.id]);

  const deleteComment = useDeleteComment();
  const toggleLike = useToggleLikeComment();

  const isOwner = comment.user.id === user?.id;

  const handleLikeClick = () => {
    if (!user?.id) return;

    const nextIsLiked = !isLikedState;
    const nextLikesCount = Math.max(0, likesCount + (nextIsLiked ? 1 : -1));

    setIsLikedState(nextIsLiked);
    setLikesCount(nextLikesCount);

    toggleLike.mutate(
      {
        userId: user.id,
        commentId: comment.id,
      },
      {
        onError: () => {
          setIsLikedState(isLikedState);
          setLikesCount(likesCount);
        },
        onSuccess: (result) => {
          if (!result.success) {
            setIsLikedState(isLikedState);
            setLikesCount(likesCount);
          }
        },
      },
    );
  };

  const handleDelete = () => {
    if (!user?.id || !comment.post?.id) return;

    deleteComment.mutate({
      userId: Number(user.id),
      commentId: Number(comment.id),
      postId: Number(comment.post.id),
    });

    setIsDeleteDialogOpen(false);
  };

  const handleProfileClick = () => {
    if (comment.user.id === user?.id) {
      navigate("/profile");
      return;
    }

    navigate(`/profile/${comment.user.username}`);
  };

  return (
    <>
      <EditComment
        open={isEditCommentOpen}
        onOpenChange={setIsEditCommentOpen}
        comment={comment}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        entityType="COMMENT"
        entityId={Number(comment.id)}
        entityTitle={comment.text?.substring(0, 50) || "Comentário"}
      />

      <Card className="mx-auto w-full max-w-[42em] border-0 border-b border-foreground/30 rounded-none bg-red shadow-none">
        <CardHeader className="mb-[0.5em] flex flex-row items-center gap-2">
          <Avatar
            className="h-[2.8em] w-[2.8em] hover:cursor-pointer"
            onClick={handleProfileClick}
          >
            <AvatarImage src={comment.user.profileImg} alt="profile image" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle
              className="text-base font-medium hover:cursor-pointer"
              onClick={handleProfileClick}
            >
              {comment.user.username}
            </CardTitle>

            <CardDescription className="text-xs">
              Publicado há {getTimeAgo(comment.createdAt)}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <EllipsisVertical className="ml-auto h-5 w-5 cursor-pointer text-muted-foreground transition-colors hover:text-primary" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isOwner ? (
                <>
                  <DropdownMenuItem
                    onClick={() => setIsEditCommentOpen(true)}
                    className="hover:cursor-pointer"
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
                        onSelect={(event) => {
                          event.preventDefault();
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
                          Esta ação não pode ser desfeita. O comentário será
                          permanentemente removido da plataforma.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="hover:cursor-pointer">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 text-zinc-100 hover:cursor-pointer hover:bg-red-700"
                          disabled={deleteComment.isPending}
                        >
                          {deleteComment.isPending ? "Deletando..." : "Excluir"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="hover:cursor-pointer">
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

                  <DropdownMenuItem
                    className="text-red-600 hover:cursor-pointer"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Denunciar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="mt-[-18px]">
          <p className="whitespace-pre-wrap break-words">{comment.text}</p>
        </CardContent>

        <CardFooter className="mt-[-20px] flex flex-col">
          <div className="mb-3 flex w-full justify-between">
            <span className="text-sm text-muted-foreground">
              {likesCount} curtidas • {comment.comments.length || 0} comentários
            </span>
          </div>

          <div className="flex w-full justify-between">
            <CardAction className="flex items-center gap-3 hover:cursor-pointer">
              {actions.map((action, index) => (
                <div
                  key={index}
                  onClick={(event) => {
                    event.preventDefault();

                    if (action.icon === Heart) {
                      handleLikeClick();
                    }
                  }}
                >
                  <action.icon
                    className={`h-5 w-5 transition-colors ${
                      index === 0 && isLikedState
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
              ))}
            </CardAction>

            <CardAction className="flex items-right gap-2 hover:cursor-pointer">
              <div>
                <Bookmark className="varient-ghost h-5 w-5 text-muted-foreground" />
              </div>
            </CardAction>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
