import type { Post as PostType } from "@/@types/post.types";
import Post from "@/components/post/Post";
import PostSkeleton from "@/components/post/PostSkeleton";
import { useGetPosts } from "@/state/usePosts";

export function FeedHome() {
  const { data, isLoading } = useGetPosts();
  const posts = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center w-full">
        <div className="max-w-[700px] w-full flex flex-col items-center">
          {Array.from({ length: 3 }).map((_, index) => (
            <PostSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <p className="text-muted-foreground">Nenhum post encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <div className="max-w-[700px] w-full flex flex-col items-center">
        {posts.map((post: PostType) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
