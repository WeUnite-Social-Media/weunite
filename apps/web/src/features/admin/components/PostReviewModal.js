"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostReviewModal = PostReviewModal;
var dialog_1 = require("@/shared/components/ui/dialog");
var button_1 = require("@/shared/components/ui/button");
var badge_1 = require("@/shared/components/ui/badge");
var avatar_1 = require("@/shared/components/ui/avatar");
var lucide_react_1 = require("lucide-react");
var getInitials_1 = require("@/shared/utils/getInitials");
var useGetTimeAgo_1 = require("@/shared/hooks/useGetTimeAgo");
var react_query_1 = require("@tanstack/react-query");
var moderationService_1 = require("@/features/admin/api/admin/moderationService");
/**
 * Modal de revisão de denúncia de posts para administradores
 */
function PostReviewModal(_a) {
    var _b, _c;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, post = _a.post;
    var queryClient = (0, react_query_1.useQueryClient)();
    var hidePostMutation = (0, react_query_1.useMutation)({
        mutationFn: function (postId) { return (0, moderationService_1.hidePostRequest)(postId); },
        onSuccess: function () {
            console.log("Post ocultado com sucesso");
            queryClient.invalidateQueries({ queryKey: ["reported-posts"] });
            onOpenChange(false);
        },
        onError: function (error) {
            console.error("Erro ao ocultar post:", error);
        },
    });
    var deletePostMutation = (0, react_query_1.useMutation)({
        mutationFn: function (postId) { return (0, moderationService_1.deletePostRequest)(postId); },
        onSuccess: function () {
            console.log("Post deletado com sucesso");
            queryClient.invalidateQueries({ queryKey: ["reported-posts"] });
            onOpenChange(false);
        },
        onError: function (error) {
            console.error("Erro ao deletar post:", error);
        },
    });
    if (!post)
        return null;
    var initials = (0, getInitials_1.getInitials)(post.user.name);
    var handleHidePost = function () {
        hidePostMutation.mutate(post.id.toString());
    };
    var handleDeletePost = function () {
        deletePostMutation.mutate(post.id.toString());
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <dialog_1.DialogHeader className="space-y-3">
          <dialog_1.DialogTitle className="text-xl">Detalhes do Post</dialog_1.DialogTitle>
          <p className="text-sm text-muted-foreground">
            Revise as informações e tome ações de moderação
          </p>
        </dialog_1.DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Usuário */}
          <div className="flex items-center gap-3">
            <avatar_1.Avatar className="h-12 w-12">
              <avatar_1.AvatarImage src={post.user.profileImg}/>
              <avatar_1.AvatarFallback>{initials}</avatar_1.AvatarFallback>
            </avatar_1.Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{post.user.name}</h3>
                <badge_1.Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Ativo
                </badge_1.Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {(0, useGetTimeAgo_1.getTimeAgo)(post.createdAt)}
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
            {post.imageUrl && (<div>
                <h4 className="text-sm font-medium mb-2">
                  Mídia anexada ao post
                </h4>
                <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
                  <img src={post.imageUrl} alt="Conteúdo do post" className="w-full h-auto object-cover max-h-[300px]"/>
                </div>
              </div>)}
          </div>

          {/* Métricas de Engajamento */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              Métricas de Engajamento
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card">
                <lucide_react_1.Heart className="h-5 w-5 text-red-500 mb-2"/>
                <p className="text-2xl font-bold">
                  {((_b = post.likes) === null || _b === void 0 ? void 0 : _b.length) || 734}
                </p>
                <p className="text-xs text-muted-foreground">Curtidas</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card">
                <lucide_react_1.MessageCircle className="h-5 w-5 text-blue-500 mb-2"/>
                <p className="text-2xl font-bold">
                  {((_c = post.comments) === null || _c === void 0 ? void 0 : _c.length) || 98}
                </p>
                <p className="text-xs text-muted-foreground">Comentários</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card">
                <lucide_react_1.Share2 className="h-5 w-5 text-green-500 mb-2"/>
                <p className="text-2xl font-bold">201</p>
                <p className="text-xs text-muted-foreground">Shares</p>
              </div>
            </div>
          </div>

          {/* Ações de Moderação */}
          <div>
            <h4 className="text-sm font-medium mb-3">Ações de Moderação</h4>
            <div className="space-y-2">
              <button_1.Button variant="outline" className="w-full justify-start gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-950/20" onClick={handleHidePost}>
                <lucide_react_1.EyeOff className="h-4 w-4"/>
                Ocultar Post
              </button_1.Button>
              <button_1.Button variant="outline" className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20" onClick={handleDeletePost}>
                <lucide_react_1.Trash2 className="h-4 w-4"/>
                Deletar Post
              </button_1.Button>
            </div>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
