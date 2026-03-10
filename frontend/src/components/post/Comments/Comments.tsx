import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import type { Post as PostType } from "@/@types/post.types";
import { X as CloseIcon } from "lucide-react";
import Post from "../Post";
import Comment from "./Comment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBreakpoints } from "@/hooks/useBreakpoints";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCreateComment, useGetComments } from "@/state/useComments";
import type { Comment as CommentType } from "@/@types/comment.types";
import { useState } from "react";
import { getInitials } from "@/utils/getInitials";

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
  const initials = getInitials(user?.name);

  const { commentDesktop } = useBreakpoints();

  const { data } = useGetComments(Number(post.id));
  const comments = data?.data;

  const { mutate: createCommentMutation } = useCreateComment();

  const max_chars = 500;

  function handleCreateComment() {
    if (!user || !commentText.trim()) return;

    createCommentMutation(
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
  }

  if (!commentDesktop) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[100vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh] mt-0 flex flex-col">
          <DrawerHeader className="pt-4 px-6 flex-shrink-0">
            <DrawerClose className="absolute rounded-sm transition-opacity right-4">
              <CloseIcon className="h-5 w-5 hover:cursor-pointer" />
            </DrawerClose>
            <DrawerTitle>Comentários</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col w-full items-center overflow-y-auto scrollbar-thumb">
            <Post post={post} />

            <div className="w-full max-w-[45em] border-y border-foreground/30 px-4 py-3 flex gap-4">
              <Avatar>
                <AvatarImage src={user?.profileImg} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="w-full max-w-full min-w-0">
                <p className="text-sm text-muted-foreground mb-1">
                  Respondendo a{" "}
                  <span className="text-sky-500 hover:cursor-pointer">
                    @{post.user.username}
                  </span>
                </p>
                <Textarea
                  placeholder="Poste sua resposta"
                  className="bg-transparent border-none resize-none w-full min-h-[8vh] max-h-[11vh] overflow-y-auto custom-scrollbar focus-visible:ring-2 p-2 text-base break-all"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />

                <div className="flex justify-end items-center gap-2 mt-3">
                  <span
                    className={`text-xs font-medium text-muted-foreground ${commentText.length > max_chars ? "text-red-500" : ""}`}
                  >
                    {commentText.length}/{max_chars}
                  </span>

                  <Button
                    size="sm"
                    variant="third"
                    className="bg-third hover:bg-third-hover text-foreground rounded-full w-[7em]"
                    onClick={handleCreateComment}
                    disabled={
                      !commentText.trim() || commentText.length > max_chars
                    }
                  >
                    Publicar
                  </Button>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[45em] p-2">
              {comments?.map((comment: CommentType) => (
                <Comment key={comment.id} comment={comment} />
              ))}
            </div>
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
        } w-[90vw] h-[90vh] p-0 rounded-xl overflow-hidden`}
      >
        <DrawerClose className="absolute rounded-sm transition-opacity right-4 top-4 z-10">
          <CloseIcon className="h-5 w-5 hover:cursor-pointer" />
        </DrawerClose>

        <div className="flex w-full h-full">
          {post.imageUrl && (
            <div className="w-1/2 h-full flex items-center justify-center bg-black">
              <img
                src={post.imageUrl}
                alt="Post"
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div
            className={`${post.imageUrl ? "w-1/2" : "w-full"} flex flex-col`}
          >
            <div className="p-4 border-b flex gap-2 bg-card z-2">
              <Avatar>
                <AvatarImage src={post.user.profileImg} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold">{post.user.username}</span>
                <p className="text-sm text-muted-foreground">{post.text}</p>
              </div>
            </div>

            <div className="flex-1 max-h-[66vh] overflow-y-auto -mt-5 p-4 custom-scrollbar">
              <div className="space-y-4">
                {comments?.map((comment: CommentType) => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </div>
            </div>

            <div className="border-t border-foreground/30 px-4 py-3">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profileImg} />
                  <AvatarFallback className="text-xs">
                    {user?.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <Textarea
                    placeholder="Poste sua resposta"
                    className="bg-transparent border-none resize-none w-full min-h-[8vh] max-h-[8vh] overflow-y-auto custom-scrollbar focus-visible:ring-2 p-2 text-base break-all"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />

                  <div className="flex justify-end items-center gap-2 mt-3">
                    <span
                      className={`text-xs font-medium text-muted-foreground ${commentText.length > max_chars ? "text-red-500" : ""}`}
                    >
                      {commentText.length}/{max_chars}
                    </span>

                    <Button
                      size="sm"
                      variant="third"
                      className="bg-third hover:bg-third-hover rounded-full w-[7em] text-background"
                      onClick={handleCreateComment}
                      disabled={
                        !commentText.trim() || commentText.length > max_chars
                      }
                    >
                      Publicar
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
