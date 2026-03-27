import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import {
  getNotificationFilterLabel,
} from "@/features/notifications/lib/notificationHelpers";
import type { NotificationFilter } from "@/features/notifications/types/notification.types";

export function NotificationPanel({
  isOpen = false,
  onOpenChange,
}: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(isOpen);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("all");

  useEffect(() => {
    if (onOpenChange) {
      setOpen(isOpen);
    }

    if (isOpen || (!onOpenChange && open)) {
      setShouldRender(true);
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);

    const timeoutId = window.setTimeout(() => {
      setShouldRender(false);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, onOpenChange, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-y-0 left-[4.5rem] z-40 w-[24rem] border-r bg-card shadow-lg transition-transform duration-300 ${
        isAnimating ? "-translate-x-full" : "translate-x-0"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-semibold">Notificacoes</h2>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-xs">
                    {getNotificationFilterLabel(filter)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(
                  [
                    "all",
                    "likes",
                    "comments",
                    "follows",
                    "messages",
                    "opportunities",
                  ] as NotificationFilter[]
                ).map((filterOption) => (
                  <DropdownMenuItem
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                  >
                    {getNotificationFilterLabel(filterOption)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-full p-1 transition-colors hover:bg-muted"
              aria-label="Fechar notificacoes"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <NotificationList filter={filter} />
        </div>
      </div>
    </div>
  );
}
