import { useParams } from "react-router-dom";
import Post from "@/features/feed/components/post/Post";
import PostSkeleton from "@/features/feed/components/post/PostSkeleton";
import { useGetPost } from "@/features/feed/state/usePosts";

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const numericPostId = Number(postId);
  const postQuery = useGetPost(numericPostId);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[45em] justify-center px-2 py-4">
      {postQuery.isLoading ? (
        <PostSkeleton />
      ) : postQuery.isError ||
        !postQuery.data?.success ||
        !postQuery.data.data ? (
        <div className="w-full rounded-xl border p-6 text-center">
          <p className="font-medium">
            Não foi possível carregar esta publicação.
          </p>
          <button
            type="button"
            className="mt-3 rounded-md border px-4 py-2"
            onClick={() => postQuery.refetch()}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <Post post={postQuery.data.data} />
      )}
    </main>
  );
}
