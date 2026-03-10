import { useQuery } from "@tanstack/react-query";
import { getUserByUsername } from "@/api/services/userService";
import { useAuthStore } from "@/stores/useAuthStore";

export const useUserProfile = (username?: string) => {
  const { user: authUser } = useAuthStore();

  const isOwnProfile = !username || username === authUser?.username;

  return useQuery({
    queryKey: ["user-profile", username],
    queryFn: async () => {
      const result = await getUserByUsername(username!);
      if (!result.success) {
        throw new Error(result.error || "Erro ao buscar usuário");
      }
      return result.data;
    },
    enabled: !isOwnProfile && !!username,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};
