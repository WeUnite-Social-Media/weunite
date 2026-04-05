import { useQuery } from "@tanstack/react-query";
import { getUserByUsername } from "@/features/profile/api/userService";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { profileKeys } from "@/features/profile/state/useUsers";

export const useUserProfile = (username?: string) => {
  const { user: authUser } = useAuthStore();

  const isOwnProfile = !username || username === authUser?.username;

  return useQuery({
    queryKey: profileKeys.detailByUsername(username || ""),
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
