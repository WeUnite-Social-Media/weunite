import { useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Briefcase,
  Heart,
  MessageCircle,
  MessageSquare,
  Repeat2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import Comments from "@/features/feed/components/post/Comments/Comments";
import { postDetailQueryOptions } from "@/features/feed/state/usePosts";
import OpportunityDetailModal from "@/features/opportunities/components/OpportunityDetailModal";
import { opportunityDetailQueryOptions } from "@/features/opportunities/state/useOpportunities";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import { getTimeAgo } from "@/shared/hooks/useGetTimeAgo";
import { getInitials } from "@/shared/utils/getInitials";
import type { Opportunity } from "@/shared/types/opportunity.types";
import type { Post } from "@/shared/types/post.types";
import type { Notification } from "@/features/notifications/types/notification.types";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: number) => void;
  onDelete: (notificationId: number) => void;
  showNewBadge?: boolean;
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "POST_LIKE":
    case "COMMENT_LIKE":
      return { icon: Heart, color: "bg-rose-500" };
    case "POST_COMMENT":
    case "COMMENT_REPLY":
      return { icon: MessageCircle, color: "bg-sky-500" };
    case "NEW_FOLLOWER":
      return { icon: UserPlus, color: "bg-violet-500" };
    case "NEW_MESSAGE":
      return { icon: MessageSquare, color: "bg-emerald-500" };
    case "POST_REPOST":
      return { icon: Repeat2, color: "bg-amber-500" };
    case "OPPORTUNITY_SUBSCRIPTION":
      return { icon: Briefcase, color: "bg-orange-500" };
    default:
      return { icon: Bell, color: "bg-muted-foreground" };
  }
};

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  showNewBadge = false,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isMobile } = useBreakpoints();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [isOpportunityOpen, setIsOpportunityOpen] = useState(false);

  const { icon: NotificationIcon, color } = getNotificationIcon(
    notification.type,
  );

  const handleDelete = (event: MouseEvent) => {
    event.stopPropagation();
    onDelete(notification.id);
  };

  const openPostContext = async (postId: number) => {
    const { queryKey, queryFn, staleTime, retry } = postDetailQueryOptions(postId);
    const postResponse = await queryClient.fetchQuery({
      queryKey,
      queryFn,
      staleTime,
      retry,
    });

    if (postResponse.success && postResponse.data) {
      setSelectedPost(postResponse.data);
      setIsCommentsOpen(true);
      return;
    }

    navigate("/home");
  };

  const openOpportunityContext = async (opportunityId: number) => {
    const { queryKey, queryFn, staleTime, retry } =
      opportunityDetailQueryOptions(opportunityId);
    const opportunityResponse = await queryClient.fetchQuery({
      queryKey,
      queryFn,
      staleTime,
      retry,
    });

    if (opportunityResponse.success && opportunityResponse.data) {
      setSelectedOpportunity(opportunityResponse.data);
      setIsOpportunityOpen(true);
      return;
    }

    navigate("/opportunity");
  };

  const handleClick = async () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    switch (notification.type) {
      case "POST_LIKE":
      case "POST_COMMENT":
      case "POST_REPOST":
        await openPostContext(notification.relatedEntityId);
        return;
      case "OPPORTUNITY_SUBSCRIPTION":
        await openOpportunityContext(notification.relatedEntityId);
        return;
      case "NEW_FOLLOWER":
        navigate(`/profile/${notification.actorUsername}`);
        return;
      case "NEW_MESSAGE":
        navigate("/chat");
        return;
      case "COMMENT_LIKE":
      case "COMMENT_REPLY":
      default:
        navigate("/home");
    }
  };

  return (
    <>
      {selectedPost && (
        <Comments
          isOpen={isCommentsOpen}
          onOpenChange={setIsCommentsOpen}
          post={selectedPost}
        />
      )}

      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          isOpen={isOpportunityOpen}
          onOpenChange={setIsOpportunityOpen}
          isMobile={isMobile}
        />
      )}

      <div
        onClick={() => void handleClick()}
        className="group flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
      >
        <div className="relative shrink-0">
          <Avatar className="h-11 w-11">
            <AvatarImage
              src={notification.actorProfileImg}
              alt={notification.actorName}
            />
            <AvatarFallback className="text-xs">
              {getInitials(notification.actorName)}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background ${color}`}
          >
            <NotificationIcon className="h-3 w-3 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {notification.actorName}
            </p>
            {showNewBadge && !notification.isRead && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                Novo
              </span>
            )}
          </div>

          <p className="mt-0.5 text-sm text-foreground/85 break-words">
            {notification.message}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            ha {getTimeAgo(notification.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!notification.isRead && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleDelete}
            aria-label="Remover notificacao"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </>
  );
};
