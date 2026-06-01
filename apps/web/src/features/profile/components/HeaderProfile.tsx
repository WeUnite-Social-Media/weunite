import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ImageUp, Loader2, Pencil, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  useCreateConversation,
  useGetUserConversations,
} from "@/features/chat/state/useChat";
import { useChatStore } from "@/features/chat/stores/useChatStore";
import EditBanner from "@/features/profile/components/EditBanner";
import EditProfile from "@/features/profile/components/EditProfile";
import Followers from "@/features/profile/components/Followers";
import Following from "@/features/profile/components/Following";
import { useFollowAction } from "@/features/profile/hooks/useFollowAction";
import { useUserProfile } from "@/features/profile/hooks/useUserProfile";
import {
  useGetFollowersCount,
  useGetFollowingCount,
} from "@/features/profile/state/useFollow";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import { useTheme } from "@/shared/providers/ThemeProvider";
import { getInitials } from "@/shared/utils/getInitials";

interface HeaderProfileProps {
  profileUsername?: string;
}

export default function HeaderProfile({ profileUsername }: HeaderProfileProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { data: profileUser } = useUserProfile(profileUsername);
  const setIsConversationOpen = useChatStore(
    (state) => state.setIsConversationOpen,
  );
  const setPendingConversationId = useChatStore(
    (state) => state.setPendingConversationId,
  );

  const isOwnProfile = !profileUsername || profileUsername === user?.username;
  const displayUser = isOwnProfile ? user : profileUser;
  const displayUserId = Number(displayUser?.id) || 0;
  const currentUserId = Number(user?.id) || 0;

  const { data: followersCountData } = useGetFollowersCount(displayUserId);
  const { data: followingCountData } = useGetFollowingCount(displayUserId);
  const { data: conversationsData } = useGetUserConversations(currentUserId);
  const { mutateAsync: createConversation, isPending: isCreatingConversation } =
    useCreateConversation();

  const followersCount =
    followersCountData?.success &&
    typeof followersCountData?.data?.data === "number"
      ? followersCountData.data.data
      : 0;

  const followingCount =
    followingCountData?.success &&
    typeof followingCountData?.data?.data === "number"
      ? followingCountData.data.data
      : 0;

  const {
    isFollowing,
    handleFollow,
    isLoading: isFollowLoading,
  } = useFollowAction(profileUsername);

  const renderFollowButton = () => (
    <Button
      variant="outline"
      onClick={handleFollow}
      className="px-3 py-2 text-sm"
      disabled={isFollowLoading}
    >
      {isFollowing ? "Deixar de seguir" : "Seguir"}
    </Button>
  );

  const initials = getInitials(displayUser?.name);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isEditBannerOpen, setIsEditBannerOpen] = useState(false);
  const requestedModal = searchParams.get("modal");

  const clearModalParam = () => {
    if (!searchParams.has("modal")) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("modal");
    setSearchParams(nextSearchParams, { replace: true });
  };

  useEffect(() => {
    if (!isOwnProfile) {
      return;
    }

    if (requestedModal === "edit-profile") {
      setIsEditProfileOpen(true);
    }

    if (requestedModal === "edit-banner") {
      setIsEditBannerOpen(true);
    }
  }, [isOwnProfile, requestedModal]);

  const handleEditProfileOpen = () => {
    setIsEditProfileOpen(true);
  };

  const handleEditProfileChange = (open: boolean) => {
    setIsEditProfileOpen(open);

    if (!open && requestedModal === "edit-profile") {
      clearModalParam();
    }
  };

  const handleFollowingOpen = () => {
    setIsFollowingOpen(true);
  };

  const handleFollowersOpen = () => {
    setIsFollowersOpen(true);
  };

  const handleBannerEdit = () => {
    setIsEditBannerOpen(true);
  };

  const handleEditBannerChange = (open: boolean) => {
    setIsEditBannerOpen(open);

    if (!open && requestedModal === "edit-banner") {
      clearModalParam();
    }
  };

  const handleChat = async () => {
    if (!currentUserId || !displayUserId || isOwnProfile) {
      return;
    }

    const existingConversation = conversationsData?.data?.find(
      (conversation) =>
        conversation.participantIds.includes(displayUserId) &&
        conversation.participantIds.length === 2,
    );

    if (existingConversation) {
      setPendingConversationId(existingConversation.id);
      setIsConversationOpen(true);
      navigate("/chat");
      return;
    }

    const result = await createConversation({
      initiatorUserId: currentUserId,
      participantIds: [currentUserId, displayUserId],
    });

    if (result.success && result.data) {
      setPendingConversationId(result.data.id);
      setIsConversationOpen(true);
      navigate("/chat");
    }
  };

  const renderProfileActions = () => {
    if (isOwnProfile) {
      return (
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleEditProfileOpen}
        >
          <Pencil className="h-4 w-4" />
          Editar perfil
        </Button>
      );
    }

    return (
      <div className="flex gap-3">
        {renderFollowButton()}
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleChat}
          disabled={isCreatingConversation}
        >
          {isCreatingConversation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isCreatingConversation ? "Abrindo..." : "Conversar"}
        </Button>
      </div>
    );
  };

  const { isDesktop } = useBreakpoints();
  const resolvedTheme = useMemo(() => {
    if (theme === "system" && typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    return theme === "dark" ? "dark" : "light";
  }, [theme]);

  const isUsernameTruncated = Boolean(
    !isDesktop && displayUser?.username && displayUser.username.length > 10,
  );

  const displayedUsername = isUsernameTruncated
    ? `${displayUser?.username?.slice(0, 10)}...`
    : displayUser?.username;

  const renderUsername = () => {
    if (!displayUser?.username) {
      return null;
    }

    const usernameClass = isDesktop
      ? "text-2xl font-medium text-primary"
      : "cursor-default text-base text-primary";

    if (!isUsernameTruncated) {
      return <p className={usernameClass}>{displayUser.username}</p>;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <p className={usernameClass}>{displayedUsername}</p>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6}>
          {displayUser.username}
        </TooltipContent>
      </Tooltip>
    );
  };

  if (isDesktop) {
    return (
      <>
        {isOwnProfile && (
          <EditProfile
            isOpen={isEditProfileOpen}
            onOpenChange={handleEditProfileChange}
          />
        )}

        {isOwnProfile && (
          <EditBanner
            isOpen={isEditBannerOpen}
            onOpenChange={handleEditBannerChange}
          />
        )}

        <Followers
          isOpen={isFollowersOpen}
          onOpenChange={setIsFollowersOpen}
          userId={displayUserId}
        />
        <Following
          isOpen={isFollowingOpen}
          onOpenChange={setIsFollowingOpen}
          userId={displayUserId}
        />

        <div className="mx-auto w-[48em] px-4">
          <div className="group relative h-40">
            <ProfileBanner
              isOwnProfile={isOwnProfile}
              resolvedTheme={resolvedTheme}
              src={displayUser?.bannerImg}
              rounded
            />
            {isOwnProfile && (
              <>
                <ImageUp
                  className="absolute top-31 right-6 z-10 text-primary transition-transform hover:scale-110 hover:cursor-pointer"
                  onClick={handleBannerEdit}
                />

                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={handleBannerEdit}
                />
              </>
            )}
          </div>

          <div className="flex w-full flex-col">
            <div className="flex w-full">
              <div className="relative ml-[0.8em] flex">
                <Avatar
                  className="mt-[-50px] h-27 w-27 rounded-full border-5 border-background bg-background"
                  onClick={isOwnProfile ? handleEditProfileOpen : undefined}
                >
                  <AvatarImage
                    src={displayUser?.profileImg}
                    alt="Foto de perfil"
                    className="h-full w-full rounded-full object-cover hover:cursor-pointer"
                  />
                  <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full border-1 border-primary text-5xl text-primary">
                    {initials}
                  </AvatarFallback>
                  {isOwnProfile && (
                    <div className="absolute right-0 bottom-2 rounded-full border border-primary bg-background p-1 shadow-sm">
                      <Pencil className="h-4 w-4 rotate-90 cursor-pointer text-primary" />
                    </div>
                  )}
                </Avatar>
              </div>

              <div className="ml-[0.5em] flex flex-col">
                {renderUsername()}
                <p className="text-xs text-[#a1a1a1]">{displayUser?.name}</p>
              </div>

              <div className="ml-auto mr-4 mt-2 flex gap-3">
                {renderProfileActions()}
              </div>
            </div>

            <div className="mt-1 flex w-full flex-row gap-3 pl-5 text-sm text-primary">
              <div
                className="flex flex-row items-center gap-1"
                onClick={handleFollowingOpen}
              >
                <span className="hover:cursor-pointer">{followingCount}</span>
                <span className="hover:cursor-pointer">Seguindo</span>
              </div>

              <div
                className="flex flex-row items-center gap-1"
                onClick={handleFollowersOpen}
              >
                <span className="hover:cursor-pointer">{followersCount}</span>
                <span className="hover:cursor-pointer">Seguidores</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isOwnProfile && (
        <EditProfile
          isOpen={isEditProfileOpen}
          onOpenChange={handleEditProfileChange}
        />
      )}

      {isOwnProfile && (
        <EditBanner
          isOpen={isEditBannerOpen}
          onOpenChange={handleEditBannerChange}
        />
      )}

      <Followers
        isOpen={isFollowersOpen}
        onOpenChange={setIsFollowersOpen}
        userId={displayUserId}
      />
      <Following
        isOpen={isFollowingOpen}
        onOpenChange={setIsFollowingOpen}
        userId={displayUserId}
      />

      <div className="mx-auto w-full md:max-w-[77vw]">
        <div className="group relative h-35">
          <ProfileBanner
            isOwnProfile={isOwnProfile}
            resolvedTheme={resolvedTheme}
            src={displayUser?.bannerImg}
          />
          {isOwnProfile && (
            <>
              <ImageUp
                className="absolute top-28 right-6 z-10 text-primary transition-transform hover:scale-110 hover:cursor-pointer"
                onClick={handleBannerEdit}
              />

              <div
                className="absolute inset-0 cursor-pointer"
                onClick={handleBannerEdit}
              />
            </>
          )}
        </div>

        <div className="flex w-full flex-col">
          <div className="flex w-full">
            <div className="relative ml-[0.8em] flex">
              <Avatar
                className="mt-[-50px] h-27 w-27 rounded-full border-5 border-background bg-background"
                onClick={isOwnProfile ? handleEditProfileOpen : undefined}
              >
                <AvatarImage
                  src={displayUser?.profileImg}
                  alt="Foto de perfil"
                  className="h-full w-full rounded-full object-cover hover:cursor-pointer"
                />
                <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full border-1 border-primary text-5xl text-primary">
                  {initials}
                </AvatarFallback>

                {isOwnProfile && (
                  <div className="absolute right-0 bottom-2 rounded-full border border-primary bg-background p-1 shadow-sm">
                    <Pencil className="h-4 w-4 rotate-90 cursor-pointer text-primary" />
                  </div>
                )}
              </Avatar>
            </div>

            <div className="ml-[0.5em] flex flex-col">
              {renderUsername()}
              <p className="text-xs text-[#a1a1a1]">{displayUser?.name}</p>
            </div>

            <div className="ml-auto mr-4 mt-2 flex gap-3">
              {renderProfileActions()}
            </div>
          </div>

          <div className="mt-1 flex w-full flex-row gap-3 pl-5 text-sm text-primary">
            <div
              className="flex flex-row items-center gap-1"
              onClick={handleFollowingOpen}
            >
              <span className="hover:cursor-pointer">{followingCount}</span>
              <span className="hover:cursor-pointer">Seguindo</span>
            </div>

            <div
              className="flex flex-row items-center gap-1"
              onClick={handleFollowersOpen}
            >
              <span className="hover:cursor-pointer">{followersCount}</span>
              <span className="hover:cursor-pointer">Seguidores</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileBanner({
  isOwnProfile,
  resolvedTheme,
  rounded = false,
  src,
}: {
  isOwnProfile: boolean;
  resolvedTheme: "dark" | "light";
  rounded?: boolean;
  src?: string;
}) {
  const roundedClass = rounded ? "rounded-b-sm" : "";

  if (src) {
    return (
      <img
        className={`h-full w-full object-cover ${roundedClass}`}
        src={src}
        alt="Banner do perfil"
      />
    );
  }

  const gradientClass =
    resolvedTheme === "dark"
      ? isOwnProfile
        ? "from-slate-950 via-slate-900 to-emerald-900/70"
        : "from-zinc-950 via-slate-900 to-slate-800"
      : isOwnProfile
        ? "from-lime-100 via-white to-emerald-100"
        : "from-slate-200 via-white to-zinc-200";

  return (
    <div
      aria-label="Banner padrao do perfil"
      className={`h-full w-full bg-gradient-to-r ${gradientClass} ${roundedClass}`}
    >
      <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_35%)]" />
    </div>
  );
}
