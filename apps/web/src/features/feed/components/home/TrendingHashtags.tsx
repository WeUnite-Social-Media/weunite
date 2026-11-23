import { useMemo } from "react";
import { Hash } from "lucide-react";
import type { PostCard } from "@/shared/types/post.types";
import { countHashtags } from "@/features/feed/utils/countHashtags";

interface TrendingHashtagsProps {
  posts: PostCard[];
}

export function TrendingHashtags({ posts }: TrendingHashtagsProps) {
  const trending = useMemo(() => countHashtags(posts, 5), [posts]);

  if (trending.length === 0) {
    return null;
  }

  return (
    <section className="mt-4 w-full rounded-lg border p-4">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <Hash className="h-4 w-4" />
        Hashtags em alta
      </h2>
      <ol className="space-y-1">
        {trending.map(({ tag, count }, index) => (
          <li key={tag} className="flex items-center justify-between text-sm">
            <span>
              <span className="mr-2 text-muted-foreground">{index + 1}.</span>
              <span className="font-medium text-third">#{tag}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {count} {count === 1 ? "post" : "posts"}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
