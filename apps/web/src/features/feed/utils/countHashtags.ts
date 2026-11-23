import type { PostCard } from "@/shared/types/post.types";

export interface TrendingHashtag {
  tag: string;
  count: number;
}

// Captura "#" seguido de letras (inclusive acentuadas), numeros ou "_".
const HASHTAG_REGEX = /#([\p{L}\p{N}_]+)/gu;

/**
 * Conta as hashtags dos posts usando um Mapa (chave = hashtag, valor = contagem)
 * e devolve as `limit` mais usadas, da maior para a menor contagem.
 */
export function countHashtags(posts: PostCard[], limit = 5): TrendingHashtag[] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    const matches = (post.text ?? "").matchAll(HASHTAG_REGEX);

    for (const match of matches) {
      const tag = match[1].toLowerCase();
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts, ([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}
