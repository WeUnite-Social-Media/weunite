import { useEffect, useRef } from "react";
import type { Post as PostType } from "@/shared/types/post.types";
import Post from "@/features/feed/components/post/Post";
import PostSkeleton from "@/features/feed/components/post/PostSkeleton";
import { useGetPosts } from "@/features/feed/state/usePosts";

export function FeedHome() {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetPosts();
  const posts = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  useEffect(() => {
    const currentTarget = loadMoreRef.current;

    if (!currentTarget || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: "300px 0px",
      },
    );

    observer.observe(currentTarget);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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

        {isFetchingNextPage &&
          Array.from({ length: 2 }).map((_, index) => (
            <PostSkeleton key={`loading-more-${index}`} />
          ))}

        <div ref={loadMoreRef} className="h-1 w-full" />

        {!hasNextPage && posts.length > 0 && (
          <p className="py-6 text-sm text-muted-foreground">
            Voce chegou ao fim das publicacoes
          </p>
        )}
      </div>
    </div>
  );
}

