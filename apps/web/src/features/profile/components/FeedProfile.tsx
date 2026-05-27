import { CircleAlert, FileText, Info, MessageSquareText } from "lucide-react";
import { useState } from "react";
import Comment from "@/features/feed/components/post/Comments/Comment";
import Post from "@/features/feed/components/post/Post";
import PostSkeleton from "@/features/feed/components/post/PostSkeleton";
import { useGetCommentsByUserId } from "@/features/feed/state/useComments";
import { useGetPostsByUser } from "@/features/feed/state/usePosts";
import AboutProfile from "@/features/profile/components/AboutProfile";
import CompanyOpportunities from "@/features/profile/components/CompanyOpportunities";
import { useUserProfile } from "@/features/profile/hooks/useUserProfile";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { Comment as CommentType } from "@/shared/types/comment.types";
import type { Post as PostType } from "@/shared/types/post.types";

interface FeedProfileProps {
  profileUsername?: string;
}

type ActiveTab = "publicacoes" | "comentarios" | "oportunidades" | "sobre";

export default function FeedProfile({ profileUsername }: FeedProfileProps) {
  const { user } = useAuthStore();
  const {
    data: profileUser,
    isError: isProfileError,
    isLoading: isProfileLoading,
  } = useUserProfile(profileUsername);

  const isOwnProfile = !profileUsername || profileUsername === user?.username;
  const displayUser = isOwnProfile ? user : profileUser;
  const isCompanyProfile = displayUser?.role === "company";

  const userId = displayUser?.id ? Number(displayUser.id) : 0;
  const {
    data: postsResponse,
    isError: isPostsError,
    isLoading: isPostsLoading,
  } = useGetPostsByUser(userId);
  const {
    data: commentsResponse,
    fetchNextPage: fetchNextCommentsPage,
    hasNextPage: hasNextCommentsPage,
    isError: isCommentsError,
    isFetchingNextPage: isFetchingNextCommentsPage,
    isLoading: isCommentsLoading,
  } = useGetCommentsByUserId(userId);

  const [activeTab, setActiveTab] = useState<ActiveTab>("publicacoes");
  const posts = (postsResponse?.data || []) as PostType[];
  const comments = (commentsResponse?.pages.flatMap(
    (page) => page.data ?? [],
  ) || []) as CommentType[];

  if (!isOwnProfile && isProfileLoading) {
    return <FeedProfileSkeleton />;
  }

  if (!isOwnProfile && isProfileError && !displayUser) {
    return (
      <div className="mx-auto max-w-2xl xl:w-[48em]">
        <ProfileSectionState
          icon={CircleAlert}
          title="Nao foi possivel carregar este perfil"
          description="Tente novamente em instantes para ver as publicacoes, comentarios e informacoes desta pessoa."
          tone="error"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl xl:w-[48em]">
      <div className="flex justify-center border-b border-primary/30 ">
        <TabButton
          isActive={activeTab === "publicacoes"}
          onClick={() => setActiveTab("publicacoes")}
        >
          Publicacoes
        </TabButton>

        <TabButton
          isActive={activeTab === "comentarios"}
          onClick={() => setActiveTab("comentarios")}
        >
          Comentarios
        </TabButton>

        {isCompanyProfile && (
          <TabButton
            isActive={activeTab === "oportunidades"}
            onClick={() => setActiveTab("oportunidades")}
          >
            Oportunidades
          </TabButton>
        )}

        <TabButton
          isActive={activeTab === "sobre"}
          onClick={() => setActiveTab("sobre")}
        >
          Sobre
        </TabButton>
      </div>

      {activeTab === "publicacoes" && (
        <div className="flex flex-col items-center justify-center">
          {isPostsLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <PostSkeleton key={`profile-post-skeleton-${index}`} />
            ))
          ) : isPostsError ? (
            <ProfileSectionState
              icon={CircleAlert}
              title="Nao foi possivel carregar as publicacoes"
              description="Tente novamente em instantes para ver o feed deste perfil."
              tone="error"
            />
          ) : posts.length > 0 ? (
            posts.map((post) => <Post key={post.id} post={post} />)
          ) : (
            <ProfileSectionState
              icon={FileText}
              title="Nenhuma publicacao encontrada"
              description="Quando este perfil publicar algo, o conteudo vai aparecer aqui."
            />
          )}
        </div>
      )}

      {activeTab === "comentarios" && (
        <div className="flex flex-col items-center justify-center">
          {isCommentsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <CommentSkeleton key={`profile-comment-skeleton-${index}`} />
            ))
          ) : isCommentsError ? (
            <ProfileSectionState
              icon={CircleAlert}
              title="Nao foi possivel carregar os comentarios"
              description="Tente novamente em instantes para ver a atividade deste perfil."
              tone="error"
            />
          ) : comments.length > 0 ? (
            <>
              {comments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))}

              {hasNextCommentsPage && (
                <Button
                  type="button"
                  variant="outline"
                  className="my-6"
                  onClick={() => void fetchNextCommentsPage()}
                  disabled={isFetchingNextCommentsPage}
                >
                  {isFetchingNextCommentsPage
                    ? "Carregando..."
                    : "Carregar mais comentarios"}
                </Button>
              )}
            </>
          ) : (
            <ProfileSectionState
              icon={MessageSquareText}
              title="Nenhum comentario encontrado"
              description="Os comentarios feitos por este perfil vao aparecer aqui."
            />
          )}
        </div>
      )}

      {activeTab === "oportunidades" && isCompanyProfile && userId > 0 && (
        <CompanyOpportunities companyId={userId} />
      )}

      {activeTab === "sobre" && (
        <div className="mb-8 mt-3 flex flex-col items-center justify-center">
          {displayUser ? (
            <AboutProfile user={displayUser} />
          ) : (
            <ProfileSectionState
              icon={Info}
              title="Informacoes indisponiveis"
              description="Nao encontramos os dados deste perfil no momento."
            />
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  children,
  isActive,
  onClick,
}: {
  children: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={`flex w-full justify-center border-b-2 py-2 text-sm transition-colors hover:text-primary cursor-pointer ${
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function FeedProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl xl:w-[48em]">
      <div className="flex justify-center border-b border-primary/30">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex w-full justify-center py-2">
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center">
        {Array.from({ length: 2 }).map((_, index) => (
          <PostSkeleton key={`feed-profile-skeleton-${index}`} />
        ))}
      </div>
    </div>
  );
}

function CommentSkeleton() {
  return (
    <Card className="w-full max-w-[45em] gap-4 border-0 border-b border-foreground/50 rounded-none shadow-none">
      <CardContent className="space-y-4 px-0 py-0">
        <div className="flex items-center gap-3 px-6 pt-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        <div className="space-y-2 px-6 pb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileSectionState({
  description,
  icon: Icon,
  title,
  tone = "default",
}: {
  description: string;
  icon: typeof FileText;
  title: string;
  tone?: "default" | "error";
}) {
  const toneClasses =
    tone === "error"
      ? "border-red-200/60 bg-red-50/60 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
      : "border-border/60 bg-card/70 text-primary";

  return (
    <Card className={`mt-6 w-full max-w-xl shadow-none ${toneClasses}`}>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
