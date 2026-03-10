import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, EyeOff, Trash2 } from "lucide-react";
import { getInitials } from "@/utils/getInitials";
import { getTimeAgo } from "@/hooks/useGetTimeAgo";
import type { Post } from "@/@types/post.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  hidePostRequest,
  deletePostRequest,
} from "@/api/services/admin/moderationService";

interface PostReviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
}

/**
 * Modal de revisão de denúncia de posts para administradores
 */
export function PostReviewModal({
  isOpen,
  onOpenChange,
  post,
}: PostReviewModalProps) {
  const queryClient = useQueryClient();

  if (!post) return null;

  const initials = getInitials(post.user.name);

  const hidePostMutation = useMutation({
    mutationFn: (postId: string) => hidePostRequest(postId),
    onSuccess: () => {
      console.log("Post ocultado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["reported-posts"] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Erro ao ocultar post:", error);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => deletePostRequest(postId),
    onSuccess: () => {
      console.log("Post deletado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["reported-posts"] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Erro ao deletar post:", error);
    },
  });

  const handleHidePost = () => {
    hidePostMutation.mutate(post.id.toString());
  };

  const handleDeletePost = () => {
    deletePostMutation.mutate(post.id.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl">Detalhes do Post</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Revise as informações e tome ações de moderação
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Usuário */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.user.profileImg} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{post.user.name}</h3>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-600 border-green-500/20"
                >
                  Ativo
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {getTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Conteúdo do Post */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Conteúdo</h4>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm whitespace-pre-wrap">{post.text}</p>
              </div>
            </div>

            {/* Mídia anexada */}
            {post.imageUrl && (
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Mídia anexada ao post
                </h4>
                <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
                  <img
                    src={post.imageUrl}
                    alt="Conteúdo do post"
                    className="w-full h-auto object-cover max-h-[300px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Métricas de Engajamento */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              Métricas de Engajamento
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card">
                <Heart className="h-5 w-5 text-red-500 mb-2" />
                <p className="text-2xl font-bold">
                  {post.likes?.length || 734}
                </p>
                <p className="text-xs text-muted-foreground">Curtidas</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card">
                <MessageCircle className="h-5 w-5 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">
                  {post.comments?.length || 98}
                </p>
                <p className="text-xs text-muted-foreground">Comentários</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card">
                <Share2 className="h-5 w-5 text-green-500 mb-2" />
                <p className="text-2xl font-bold">201</p>
                <p className="text-xs text-muted-foreground">Shares</p>
              </div>
            </div>
          </div>

          {/* Ações de Moderação */}
          <div>
            <h4 className="text-sm font-medium mb-3">Ações de Moderação</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-950/20"
                onClick={handleHidePost}
              >
                <EyeOff className="h-4 w-4" />
                Ocultar Post
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20"
                onClick={handleDeletePost}
              >
                <Trash2 className="h-4 w-4" />
                Deletar Post
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
