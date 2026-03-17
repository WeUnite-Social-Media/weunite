import { useState } from "react";
import Post from "@/features/feed/components/post/Post";
import Comment from "@/features/feed/components/post/Comments/Comment";
import type { Post as PostType } from "@/shared/types/post.types";
import type { Comment as CommentType } from "@/shared/types/comment.types";
import { useGetPostsByUser } from "@/features/feed/state/usePosts";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useGetCommentsByUserId } from "@/features/feed/state/useComments";
import AboutProfile from "./AboutProfile";
import { useUserProfile } from "@/features/profile/hooks/useUserProfile";

interface FeedProfileProps {
  profileUsername?: string;
}

export default function FeedProfile({ profileUsername }: FeedProfileProps) {
  const { user } = useAuthStore();
  const { data: profileUser } = useUserProfile(profileUsername);

  const isOwnProfile = !profileUsername || profileUsername === user?.username;
  const displayUser = isOwnProfile ? user : profileUser;

  const { data } = useGetPostsByUser(displayUser?.id ? Number(displayUser.id) : 0);

  const { data: dataComments } = useGetCommentsByUserId(
    displayUser?.id ? Number(displayUser.id) : 0,
  );
  const [activeTab, setActiveTab] = useState("publicacoes");
  const posts = data?.data || [];
  const comments = dataComments?.data || [];

  const userPosts = posts as PostType[];
  const userComments =
    comments.filter(
      (comment: CommentType) => comment.user?.id === displayUser?.id,
    ) || [];

  return (
    <div className="max-w-2xl xl:w-[48em] mx-auto">
      <div className="flex border-b border-primary justify-center">
        <div
          className={`w-full justify-center flex cursor-pointer py-2 ${
            activeTab === "publicacoes" ? "border-b-2 border-primary" : ""
          }`}
          onClick={() => setActiveTab("publicacoes")}
        >
          <p className="">Publicações</p>
        </div>

        <div
          className={`w-full justify-center flex cursor-pointer py-2 ${
            activeTab === "comentarios" ? "border-b-2 border-primary" : ""
          }`}
          onClick={() => setActiveTab("comentarios")}
        >
          <p className="">Comentários</p>
        </div>

        <div
          className={`w-full justify-center flex cursor-pointer py-2 ${
            activeTab === "Sobre" ? "border-b-2 border-primary" : ""
          }`}
          onClick={() => setActiveTab("Sobre")}
        >
          <p className="">Sobre</p>
        </div>
      </div>

      {activeTab === "publicacoes" && (
        <div className="flex flex-col items-center justify-center">
          {userPosts.length > 0 ? (
            userPosts.map((post: PostType) => (
              <Post key={post.id} post={post} />
            ))
          ) : (
            <p className="text-gray-500 mt-8">Nenhuma publicação encontrada</p>
          )}
        </div>
      )}

      {activeTab === "comentarios" && (
        <div className="flex flex-col items-center justify-center">
          {userComments.length > 0 ? (
            userComments.map((comment: CommentType) => (
              <Comment key={comment.id} comment={comment} />
            ))
          ) : (
            <p className="text-gray-500 mt-8">Nenhum comentário encontrado</p>
          )}
        </div>
      )}

      {activeTab === "Sobre" && (
        <div className="flex flex-col items-center justify-center mt-3">
          <AboutProfile />
        </div>
      )}
    </div>
  );
}
