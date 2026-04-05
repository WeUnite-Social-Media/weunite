import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import { useGetUnreadCount } from "@/features/notifications/state/useNotifications";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);
  const { maxLeftSideBar } = useBreakpoints();

  const { data: unreadCountResponse } = useGetUnreadCount(userId ? Number(userId) : 0);
  const unreadCount =
    unreadCountResponse?.success && unreadCountResponse.data
      ? unreadCountResponse.data.unreadCount
      : 0;

  const bellButton = (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={maxLeftSideBar ? () => setIsOpen(true) : undefined}
      aria-label="Abrir notificacoes"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  );

  if (maxLeftSideBar) {
    return (
      <>
        {bellButton}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="h-[90vh] p-0">
            <SheetHeader className="border-b px-4 py-4">
              <SheetTitle>Notificacoes</SheetTitle>
            </SheetHeader>
            <div className="h-[calc(90vh-4.5rem)]">
              <NotificationList />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{bellButton}</PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        <div className="h-[32rem]">
          <NotificationList />
        </div>
      </PopoverContent>
    </Popover>
  );
};
