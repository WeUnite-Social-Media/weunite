import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { Button } from "@/shared/components/ui/button";
import type { Post as PostType } from "@/shared/types/post.types";
import { X as CloseIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Post from "@/features/feed/components/post/Post";
import Comment from "@/features/feed/components/post/Comments/Comment";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Textarea } from "@/shared/components/ui/textarea";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import {
  useCreateComment,
  useGetComments,
} from "@/features/feed/state/useComments";
import type { Comment as CommentType } from "@/shared/types/comment.types";
import { getInitials } from "@/shared/utils/getInitials";

const COMMENT_LIMIT = 500;

interface CommentsProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  post: PostType;
}

export default function Comments({
  isOpen,
  onOpenChange,
  post,
}: CommentsProps) {
  const [commentText, setCommentText] = useState("");

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const currentUserInitials = getInitials(user?.name);
  const postAuthorInitials = getInitials(post.user.name);

  const { commentDesktop } = useBreakpoints();
  const {
    data,
    isError: isCommentsError,
    isLoading: isCommentsLoading,
  } = useGetComments(Number(post.id));

  const comments = (data?.data || []) as CommentType[];
  const createComment = useCreateComment();

  const handleCreateComment = () => {
    if (!user || !commentText.trim()) return;

    createComment.mutate(
      {
        data: { text: commentText, image: null },
        userId: Number(user.id),
        postId: Number(post.id),
      },
      {
        onSuccess: (result: { success: boolean }) => {
          if (result.success) {
            setCommentText("");
          }
        },
      },
    );
  };

  const handlePostAuthorClick = () => {
    if (post.user.id === user?.id) {
      navigate("/profile");
      return;
    }

    navigate(`/profile/${post.user.username}`);
  };

  const renderCommentsList = () => {
    if (isCommentsLoading) {
      return (
        <p className="py-4 text-center text-muted-foreground">
          Carregando comentários...
        </p>
      );
    }

    if (isCommentsError) {
      return (
        <p className="py-4 text-center text-red-500">
          Erro ao carregar comentários.
        </p>
      );
    }

    if (!comments.length) {
      return (
        <p className="py-4 text-center text-muted-foreground">
          Nenhum comentário ainda.
        </p>
      );
    }

    return comments.map((comment) => <Comment key={comment.id} comment={comment} />);
  };

  if (!commentDesktop) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="mt-0 flex h-[100vh] flex-col data-[vaul-drawer-direction=bottom]:max-h-[100vh]">
          <DrawerHeader className="flex-shrink-0 px-6 pt-4">
            <DrawerClose className="absolute right-4 rounded-sm transition-opacity">
              <CloseIcon className="h-5 w-5 hover:cursor-pointer" />
            </DrawerClose>
            <DrawerTitle>Comentários</DrawerTitle>
          </DrawerHeader>

          <div className="scrollbar-thumb flex w-full flex-col items-center overflow-y-auto">
            <Post post={post} />

            <div className="flex w-full max-w-[45em] gap-4 border-y border-foreground/30 px-4 py-3">
              <Avatar>
                <AvatarImage src={user?.profileImg} />
                <AvatarFallback>{currentUserInitials}</AvatarFallback>
              </Avatar>

              <div className="w-full max-w-full min-w-0">
                <p className="mb-1 text-sm text-muted-foreground">
                  Respondendo a{" "}
                  <button
                    type="button"
                    className="text-sky-500 hover:cursor-pointer"
                    onClick={handlePostAuthorClick}
                  >
                    @{post.user.username}
                  </button>
                </p>

                <Textarea
                  placeholder="Poste sua resposta"
                  className="custom-scrollbar min-h-[8vh] max-h-[11vh] w-full resize-none break-all border-none bg-transparent p-2 text-base focus-visible:ring-2"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                />

                <div className="mt-3 flex items-center justify-end gap-2">
                  <span
                    className={`text-xs font-medium text-muted-foreground ${
                      commentText.length > COMMENT_LIMIT ? "text-red-500" : ""
                    }`}
                  >
                    {commentText.length}/{COMMENT_LIMIT}
                  </span>

                  <Button
                    size="sm"
                    variant="third"
                    className="w-[7em] rounded-full bg-third text-foreground hover:bg-third-hover"
                    onClick={handleCreateComment}
                    disabled={
                      createComment.isPending ||
                      !commentText.trim() ||
                      commentText.length > COMMENT_LIMIT
                    }
                    aria-busy={createComment.isPending}
                  >
                    {createComment.isPending ? "Publicando..." : "Publicar"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[45em] p-2">{renderCommentsList()}</div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          post.imageUrl ? "max-w-6xl" : "max-w-3xl"
        } h-[90vh] w-[90vw] overflow-hidden rounded-xl p-0`}
      >
        <DrawerClose className="absolute right-4 top-4 z-10 rounded-sm transition-opacity">
          <CloseIcon className="h-5 w-5 hover:cursor-pointer" />
        </DrawerClose>

        <div className="flex h-full w-full">
          {post.imageUrl ? (
            <div className="flex h-full w-1/2 items-center justify-center bg-black">
              <img
                src={post.imageUrl}
                alt="Post"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className={`${post.imageUrl ? "w-1/2" : "w-full"} flex flex-col`}>
            <div className="z-2 flex gap-2 border-b bg-card p-4">
              <Avatar
                className="hover:cursor-pointer"
                onClick={handlePostAuthorClick}
              >
                <AvatarImage src={post.user.profileImg} />
                <AvatarFallback>{postAuthorInitials}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <button
                  type="button"
                  className="w-fit font-semibold hover:cursor-pointer"
                  onClick={handlePostAuthorClick}
                >
                  {post.user.username}
                </button>
                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {post.text}
                </p>
              </div>
            </div>

            <div className="custom-scrollbar flex-1 max-h-[66vh] overflow-y-auto p-4">
              <div className="space-y-4">{renderCommentsList()}</div>
            </div>

            <div className="border-t border-foreground/30 px-4 py-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImg} />
                  <AvatarFallback className="text-xs">
                    {currentUserInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <Textarea
                    placeholder="Poste sua resposta"
                    className="custom-scrollbar min-h-[8vh] max-h-[8vh] w-full resize-none break-all border-none bg-transparent p-2 text-base focus-visible:ring-2"
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                  />

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <span
                      className={`text-xs font-medium text-muted-foreground ${
                        commentText.length > COMMENT_LIMIT ? "text-red-500" : ""
                      }`}
                    >
                      {commentText.length}/{COMMENT_LIMIT}
                    </span>

                    <Button
                      size="sm"
                      variant="third"
                      className="w-[7em] rounded-full bg-third text-background hover:bg-third-hover"
                      onClick={handleCreateComment}
                      disabled={
                        createComment.isPending ||
                        !commentText.trim() ||
                        commentText.length > COMMENT_LIMIT
                      }
                      aria-busy={createComment.isPending}
                    >
                      {createComment.isPending ? "Publicando..." : "Publicar"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
