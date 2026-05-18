import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMessagesRequest } from "@/features/chat/api/chatService";

export const useSearchMessages = (
  query: string,
  userId: number,
  debounceMs: number = 300,
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs]);

  return useQuery({
    queryKey: ["search-chat-messages", userId, debouncedQuery],
    queryFn: async () => {
      const result = await searchMessagesRequest(userId, debouncedQuery);

      if (!result.success) {
        throw new Error(result.error || "Erro ao buscar mensagens");
      }

      return result.data ?? [];
    },
    enabled: debouncedQuery.trim().length > 0 && userId > 0,
    staleTime: 60 * 1000,
    retry: 1,
  });
};
