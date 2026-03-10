import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/api/services/searchService";

export const useSearchUsers = (query: string, debounceMs: number = 300) => {
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
    queryKey: ["search-users", debouncedQuery],
    queryFn: async () => {
      const result = await searchUsers(debouncedQuery);
      if (!result.success) {
        throw new Error(result.error || "Erro ao buscar usuários");
      }
      return result.data;
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
