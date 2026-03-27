import { useState } from "react";
import Post from "@/features/feed/components/post/Post";
import Comment from "@/features/feed/components/post/Comments/Comment";
import type { Post as PostType } from "@/shared/types/post.types";
import type { Comment as CommentType } from "@/shared/types/comment.types";
import { useGetPostsByUser } from "@/features/feed/state/usePosts";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useGetCommentsByUserId } from "@/features/feed/state/useComments";
import AboutProfile from "@/features/profile/components/AboutProfile";
import { useUserProfile } from "@/features/profile/hooks/useUserProfile";
import CompanyOpportunities from "@/features/profile/components/CompanyOpportunities";

interface FeedProfileProps {
  profileUsername?: string;
}

export default function FeedProfile({ profileUsername }: FeedProfileProps) {
  const { user } = useAuthStore();
  const { data: profileUser } = useUserProfile(profileUsername);

  const isOwnProfile = !profileUsername || profileUsername === user?.username;
  const displayUser = isOwnProfile ? user : profileUser;
  const isCompanyProfile = displayUser?.role === "company";

  const userId = displayUser?.id ? Number(displayUser.id) : 0;
  const { data: postsResponse } = useGetPostsByUser(userId);
  const { data: commentsResponse } = useGetCommentsByUserId(userId);

  const [activeTab, setActiveTab] = useState("publicacoes");
  const posts = (postsResponse?.data || []) as PostType[];
  const comments = (commentsResponse?.data || []) as CommentType[];

  return (
    <div className="mx-auto max-w-2xl xl:w-[48em]">
      <div className="flex justify-center border-b border-primary">
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
          {posts.length > 0 ? (
            posts.map((post) => <Post key={post.id} post={post} />)
          ) : (
            <p className="mt-8 text-gray-500">Nenhuma publicacao encontrada</p>
          )}
        </div>
      )}

      {activeTab === "comentarios" && (
        <div className="flex flex-col items-center justify-center">
          {comments.length > 0 ? (
            comments.map((comment) => <Comment key={comment.id} comment={comment} />)
          ) : (
            <p className="mt-8 text-gray-500">Nenhum comentario encontrado</p>
          )}
        </div>
      )}

      {activeTab === "oportunidades" && isCompanyProfile && userId > 0 && (
        <CompanyOpportunities companyId={userId} />
      )}

      {activeTab === "sobre" && (
        <div className="mt-3 mb-8 flex flex-col items-center justify-center">
          <AboutProfile user={displayUser} />
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
    <div
      className={`flex w-full cursor-pointer justify-center py-2 ${
        isActive ? "border-b-2 border-primary" : ""
      }`}
      onClick={onClick}
    >
      <p>{children}</p>
    </div>
  );
}
