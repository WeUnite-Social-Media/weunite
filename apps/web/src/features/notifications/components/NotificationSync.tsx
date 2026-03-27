import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useNotificationRealtime } from "@/features/notifications/hooks/useNotificationRealtime";

export function NotificationSync() {
  const userId = useAuthStore((state) => state.user?.id);

  useNotificationRealtime(userId ? Number(userId) : undefined);

  return null;
}
