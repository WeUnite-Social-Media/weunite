import { useMemo, useState } from "react";
import { Bell, CheckCheck, Filter, Search, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import {
  getNotificationFilterLabel,
  groupNotificationsByPeriod,
  isNewNotification,
  matchesNotificationFilter,
} from "@/features/notifications/lib/notificationHelpers";
import {
  useDeleteNotification,
  useGetNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "@/features/notifications/state/useNotifications";
import type { Notification, NotificationFilter } from "@/features/notifications/types/notification.types";

const PeriodHeader = ({ children }: { children: string }) => (
  <div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  </div>
);

export const NotificationList = ({
  filter: externalFilter,
}: {
  filter?: NotificationFilter;
}) => {
  const userId = useAuthStore((state) => state.user?.id);
  const { maxLeftSideBar } = useBreakpoints();
  const [internalFilter, setInternalFilter] = useState<NotificationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const activeFilter = externalFilter || internalFilter;
  const numericUserId = userId ? Number(userId) : 0;

  const { data: notificationsResponse, isLoading } =
    useGetNotifications(numericUserId);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const notifications = useMemo(
    () =>
      notificationsResponse?.success && notificationsResponse.data
        ? notificationsResponse.data
        : [],
    [notificationsResponse],
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesFilter = matchesNotificationFilter(notification, activeFilter);
      const normalizedQuery = searchQuery.trim().toLowerCase();

      if (!normalizedQuery) {
        return matchesFilter;
      }

      const matchesSearch =
        notification.actorName.toLowerCase().includes(normalizedQuery) ||
        notification.message.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, notifications, searchQuery]);

  const groupedNotifications = useMemo(
    () => groupNotificationsByPeriod(filteredNotifications),
    [filteredNotifications],
  );

  const hasUnread = notifications.some((notification) => !notification.isRead);

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead({ userId: numericUserId, notificationId });
  };

  const handleDeleteNotification = (notificationId: number) => {
    deleteNotification({ userId: numericUserId, notificationId });
  };

  const renderNotificationGroup = (
    label: string,
    periodNotifications: Notification[],
  ) => {
    if (periodNotifications.length === 0) {
      return null;
    }

    return (
      <div key={label}>
        <PeriodHeader>{label}</PeriodHeader>
        <div>
          {periodNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
              showNewBadge={isNewNotification(notification.createdAt)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b">
        {maxLeftSideBar && !externalFilter && (
          <>
            <div className="flex items-center justify-between px-4 py-2.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {getNotificationFilterLabel(activeFilter)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {(
                    [
                      "all",
                      "likes",
                      "comments",
                      "follows",
                      "messages",
                      "opportunities",
                    ] as NotificationFilter[]
                  ).map((filter) => (
                    <DropdownMenuItem
                      key={filter}
                      onClick={() => setInternalFilter(filter)}
                    >
                      {getNotificationFilterLabel(filter)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowSearch((currentValue) => !currentValue)}
                aria-label="Pesquisar notificacoes"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {showSearch && (
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Buscar notificacoes..."
                    className="pl-9 pr-9"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      aria-label="Limpar busca"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {!maxLeftSideBar && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar notificacoes..."
                className="pl-9"
              />
            </div>
          </div>
        )}

        {hasUnread && (
          <div className="flex justify-end px-4 pb-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary hover:text-primary"
              onClick={() => markAllAsRead({ userId: numericUserId })}
            >
              <CheckCheck className="mr-1 h-4 w-4" />
              Marcar todas como lidas
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-3 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 py-12 text-center">
            <Bell className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {notifications.length === 0
                ? "Nenhuma notificacao ainda"
                : "Nenhuma notificacao encontrada"}
            </p>
            {(activeFilter !== "all" || searchQuery) && (
              <Button
                variant="link"
                className="mt-2 h-auto px-0 text-xs"
                onClick={() => {
                  setInternalFilter("all");
                  setSearchQuery("");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div>
            {renderNotificationGroup("Hoje", groupedNotifications.today)}
            {renderNotificationGroup("Ontem", groupedNotifications.yesterday)}
            {renderNotificationGroup("Esta semana", groupedNotifications.thisWeek)}
            {renderNotificationGroup("Antigas", groupedNotifications.older)}
          </div>
        )}
      </div>
    </div>
  );
};
