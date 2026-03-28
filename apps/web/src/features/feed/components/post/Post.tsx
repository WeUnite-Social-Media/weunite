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
  ChevronDown,
  ChevronUp,
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import Comments from "@/features/feed/components/post/Comments/Comments";
import { EditPost } from "@/features/feed/components/post/EditPost";
import { useToggleLike } from "@/features/feed/state/useLikes";
import { useDeletePost } from "@/features/feed/state/usePosts";
import { ReportModal } from "@/features/reporting/components/ReportModal";
import { getTimeAgo } from "@/shared/hooks/useGetTimeAgo";
import type { Post } from "@/shared/types/post.types";
import { getInitials } from "@/shared/utils/getInitials";

const actions = [{ icon: Heart }, { icon: MessageCircle }, { icon: Repeat2 }];
const POST_PREVIEW_LENGTH = 200;

export default function Post({ post }: { post: Post }) {
  const initials = getInitials(post.user.name);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const toggleLike = useToggleLike();
  const deletePost = useDeletePost();

  const isLiked = post.likes.some((like) => like.user.id === user?.id);
  const isOwner = post.user.id === user?.id;

  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const postText = post.text ?? "";
  const shouldTruncate = postText.length > POST_PREVIEW_LENGTH;
  const visiblePostText =
    shouldTruncate && !isExpanded
      ? `${postText.slice(0, POST_PREVIEW_LENGTH).trimEnd()}...`
      : postText;

  const handleLikeClick = () => {
    if (!user?.id) return;

    toggleLike.mutate({ postId: post.id, userId: user.id, commentId: "" });
  };

  const handleDelete = () => {
    if (!user?.id) return;

    deletePost.mutate({
      userId: Number(user.id),
      postId: Number(post.id),
    });

    setIsDeleteDialogOpen(false);
  };

  const handleProfileClick = () => {
    if (isOwner) {
      navigate("/profile");
      return;
    }

    navigate(`/profile/${post.user.username}`);
  };

  return (
    <>
      <Comments
        isOpen={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
        post={post}
      />

      <EditPost
        open={isEditPostOpen}
        onOpenChange={setIsEditPostOpen}
        post={post}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        entityType="POST"
        entityId={Number(post.id)}
        entityTitle={
          postText.substring(0, 50) + (postText.length > 50 ? "..." : "")
        }
      />

      <Card className="w-full max-w-[45em] border-0 border-b border-foreground/50 rounded-none bg-red shadow-none">
        <CardHeader className="mb-[0.5em] flex flex-row items-center gap-2">
          <Avatar
            className="h-[2.8em] w-[2.8em] hover:cursor-pointer"
            onClick={handleProfileClick}
          >
            <AvatarImage src={post.user.profileImg} alt="profile image" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle
              className="text-base font-medium hover:cursor-pointer"
              onClick={handleProfileClick}
            >
              {post.user.username}
            </CardTitle>

            <CardDescription className="text-xs">
              Publicado há {getTimeAgo(post.createdAt)}
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
                    onClick={() => setIsEditPostOpen(true)}
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
                          className="bg-red-600 text-zinc-100 hover:cursor-pointer hover:bg-red-700"
                          disabled={deletePost.isPending}
                        >
                          {deletePost.isPending ? "Deletando..." : "Excluir"}
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

        <CardContent className="mt-[-18px] w-full">
          <div className="flex w-full items-center justify-center">
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt="Post media"
                className="mb-2 rounded-sm"
              />
            ) : null}
          </div>

          {postText ? (
            <div className="space-y-2">
              <p className="whitespace-pre-wrap break-words">{visiblePostText}</p>

              {shouldTruncate ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
                  onClick={() => setIsExpanded((current) => !current)}
                >
                  {isExpanded ? (
                    <>
                      Ver menos
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Ler mais
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : null}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="mt-[-20px] flex flex-col">
          <div className="mb-3 flex w-full justify-between">
            <span className="text-sm text-muted-foreground">
              {post.likes.length || 0} curtidas • {post.comments.length || 0}{" "}
              comentários
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
                    } else if (action.icon === MessageCircle) {
                      setIsCommentsOpen(true);
                    }
                  }}
                >
                  <action.icon
                    className={`h-5 w-5 transition-colors ${
                      index === 0 && isLiked
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
