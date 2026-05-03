import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { ReportModal } from "@/features/reporting/components/ReportModal";
import {
  useCheckIsSaved,
  useCheckIsSubscribed,
  useDeleteOpportunity,
  useToggleSavedOpportunity,
  useToggleSubscriber,
} from "@/features/opportunities/state/useOpportunities";
import { isOpportunityExpired } from "@/features/opportunities/utils/opportunityDates";
import { OpportunityDescription } from "./DescriptionOpportunity";
import { EditOpportunity } from "./EditOpportunity";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { getTimeAgo } from "@/shared/hooks/useGetTimeAgo";
import { getInitials } from "@/shared/utils/getInitials";
import type { Opportunity } from "@/shared/types/opportunity.types";
import {
  Bookmark,
  Calendar,
  Edit,
  EllipsisVertical,
  Flag,
  MapPin,
  Share,
  Trash2,
  Users,
} from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const deleteOpportunity = useDeleteOpportunity();
  const toggleSubscriber = useToggleSubscriber();
  const toggleSavedOpportunity = useToggleSavedOpportunity();

  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditOpportunityOpen, setIsEditOpportunityOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const companyName =
    opportunity.company?.name || opportunity.company?.username || "";
  const initials = getInitials(companyName);
  const timeAgo = getTimeAgo(opportunity.createdAt);
  const updatedTimeAgo = opportunity.updatedAt
    ? getTimeAgo(opportunity.updatedAt)
    : null;
  const deadlineDate = new Date(opportunity.dateEnd).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );

  const isOwner = opportunity.company?.id === user?.id;
  const isAthlete = user?.role === "athlete";
  const subscribersCount =
    opportunity.subscribersCount ?? opportunity.subscribers?.length ?? 0;

  const { data: isSubscribedData } = useCheckIsSubscribed(
    Number(user?.id),
    Number(opportunity.id),
    Boolean(user?.id) && isAthlete && !isOwner,
  );
  const { data: isSavedData } = useCheckIsSaved(
    Number(user?.id),
    Number(opportunity.id),
    Boolean(user?.id) && isAthlete,
  );

  const isSubscribed = isSubscribedData?.data ?? false;
  const isSaved = isSavedData?.data ?? false;
  const isExpired = isOpportunityExpired(opportunity.dateEnd);
  const isSubscriptionClosed = !isSubscribed && isExpired;

  const handleCompanyClick = (event: MouseEvent) => {
    event.stopPropagation();

    if (isOwner) {
      navigate("/profile");
      return;
    }

    navigate(
      opportunity.company?.username
        ? `/profile/${opportunity.company.username}`
        : "/profile",
    );
  };

  const handleDelete = () => {
    if (!user?.id) {
      return;
    }

    deleteOpportunity.mutate({
      companyId: Number(user.id),
      opportunityId: Number(opportunity.id),
    });

    setIsDeleteDialogOpen(false);
  };

  const handleCardClick = () => {
    setIsDescriptionOpen(true);
  };

  const handleApply = (event: MouseEvent) => {
    event.stopPropagation();

    if (
      !user?.id ||
      !isAthlete ||
      toggleSubscriber.isPending ||
      isSubscriptionClosed
    ) {
      return;
    }

    toggleSubscriber.mutate({
      athleteId: Number(user.id),
      opportunityId: Number(opportunity.id),
    });
  };

  const handleBookmark = (event: MouseEvent) => {
    event.stopPropagation();

    if (!user?.id || !isAthlete || toggleSavedOpportunity.isPending) {
      return;
    }

    toggleSavedOpportunity.mutate({
      athleteId: Number(user.id),
      opportunityId: Number(opportunity.id),
    });
  };

  const handleDropdownClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const subscribeLabel = toggleSubscriber.isPending
    ? "Processando..."
    : isSubscribed
      ? "Cancelar candidatura"
      : isSubscriptionClosed
        ? "Prazo encerrado"
        : "Candidatar-se";

  const subscribeButtonVariant = isSubscriptionClosed
    ? "secondary"
    : isSubscribed
      ? "destructive"
      : "default";

  return (
    <>
      <Card
        className="w-full max-w-[45em] cursor-pointer rounded-none border-0 border-foreground/50 bg-card shadow-none transition-colors hover:bg-muted/30"
        onClick={handleCardClick}
      >
        <CardHeader className="mb-[0.5em] flex flex-row items-center gap-2">
          <Avatar
            className="h-[2.8em] w-[2.8em] cursor-pointer"
            onClick={handleCompanyClick}
          >
            <AvatarImage
              src={opportunity.company?.profileImg}
              alt={`${companyName} logo`}
            />
            <AvatarFallback className="bg-third/10 font-semibold text-third">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle
              className="cursor-pointer text-base font-medium"
              onClick={handleCompanyClick}
            >
              {opportunity.company?.username || companyName}
            </CardTitle>
            <CardDescription className="text-xs">
              ha {timeAgo}
              {updatedTimeAgo && updatedTimeAgo !== timeAgo ? (
                <span>{` · Atualizado há ${updatedTimeAgo}`}</span>
              ) : null}
            </CardDescription>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div onClick={handleDropdownClick}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <EllipsisVertical className="h-5 w-5 cursor-pointer text-muted-foreground transition-colors hover:text-primary" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isOwner ? (
                    <>
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(
                            `/opportunity/${opportunity.id}/subscribers`,
                          );
                        }}
                        className="cursor-pointer"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Ver inscritos ({subscribersCount})
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsEditOpportunityOpen(true);
                        }}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>

                      <AlertDialog
                        open={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={(event) => {
                              event.preventDefault();
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acao nao pode ser desfeita. A oportunidade
                              sera removida permanentemente da plataforma.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="cursor-pointer bg-red-600 text-zinc-100 hover:bg-red-700"
                              disabled={deleteOpportunity.isPending}
                            >
                              {deleteOpportunity.isPending
                                ? "Excluindo..."
                                : "Excluir"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem className="cursor-pointer">
                        <Share className="mr-2 h-4 w-4" />
                        Compartilhar
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <Share className="mr-2 h-4 w-4" />
                        Compartilhar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsReportModalOpen(true);
                        }}
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Denunciar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="mt-[-18px] w-full">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">
              {opportunity.title}
            </h3>

            <p className="line-clamp-3 text-xs text-foreground">
              {opportunity.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{opportunity.location}</span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Ate {deadlineDate}</span>
              </div>

              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{subscribersCount} candidatos</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="mt-[-15px] flex flex-col">
          <div className="flex w-full items-center justify-between">
            <CardAction className="flex items-center gap-3">
              {!isOwner && isAthlete ? (
                <Button
                  size="sm"
                  variant={subscribeButtonVariant}
                  className={
                    subscribeButtonVariant === "default"
                      ? "rounded-full bg-third px-4 text-white hover:bg-third/90"
                      : "rounded-full px-4"
                  }
                  onClick={handleApply}
                  disabled={toggleSubscriber.isPending || isSubscriptionClosed}
                >
                  {subscribeLabel}
                </Button>
              ) : null}

              {isOwner ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-third px-4 text-third hover:bg-third hover:text-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/opportunity/${opportunity.id}/subscribers`);
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Ver inscritos ({subscribersCount})
                </Button>
              ) : null}
            </CardAction>

            <CardAction className="flex items-center gap-2">
              {isAthlete ? (
                <div onClick={handleBookmark} className="cursor-pointer">
                  <Bookmark
                    className={`h-5 w-5 transition-colors ${
                      isSaved
                        ? "fill-third text-third"
                        : "text-muted-foreground hover:text-third"
                    }`}
                  />
                </div>
              ) : null}
            </CardAction>
          </div>
        </CardFooter>
      </Card>

      <OpportunityDescription
        isOpen={isDescriptionOpen}
        onOpenChange={setIsDescriptionOpen}
        opportunity={opportunity}
      />

      <EditOpportunity
        open={isEditOpportunityOpen}
        onOpenChange={setIsEditOpportunityOpen}
        opportunity={opportunity}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        entityType="OPPORTUNITY"
        entityId={Number(opportunity.id)}
        entityTitle={opportunity.title}
      />
    </>
  );
}
