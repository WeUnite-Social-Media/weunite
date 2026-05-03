import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  useCheckIsSubscribed,
  useToggleSubscriber,
} from "@/features/opportunities/state/useOpportunities";
import { isOpportunityExpired } from "@/features/opportunities/utils/opportunityDates";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import { getTimeAgo } from "@/shared/hooks/useGetTimeAgo";
import { getInitials } from "@/shared/utils/getInitials";
import type { Opportunity } from "@/shared/types/opportunity.types";
import { Calendar, MapPin, Users, X as CloseIcon } from "lucide-react";
import { toast } from "sonner";

interface OpportunityDescriptionProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  opportunity: Opportunity;
}

export function OpportunityDescription({
  isOpen,
  onOpenChange,
  opportunity,
}: OpportunityDescriptionProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { commentDesktop } = useBreakpoints();
  const toggleSubscriber = useToggleSubscriber();

  const companyName =
    opportunity.company?.name || opportunity.company?.username || "Empresa";
  const companyInitials = getInitials(companyName);
  const isOwner = opportunity.company?.id === user?.id;
  const isAthlete = user?.role === "athlete";
  const subscribersCount =
    opportunity.subscribersCount ?? opportunity.subscribers?.length ?? 0;

  const { data: isSubscribedData } = useCheckIsSubscribed(
    Number(user?.id),
    Number(opportunity.id),
    Boolean(user?.id) && isAthlete && !isOwner,
  );

  const isSubscribed = isSubscribedData?.data ?? false;
  const isExpired = isOpportunityExpired(opportunity.dateEnd);
  const isSubscriptionClosed = !isSubscribed && isExpired;

  const opportunityDate = new Date(opportunity.dateEnd).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );

  const handleApply = () => {
    if (!user?.id || !isAthlete || toggleSubscriber.isPending) {
      return;
    }

    if (isSubscriptionClosed) {
      toast.error("O prazo desta oportunidade ja expirou.");
      return;
    }

    toggleSubscriber.mutate({
      athleteId: Number(user.id),
      opportunityId: Number(opportunity.id),
    });
  };

  const handleViewSubscribers = () => {
    onOpenChange?.(false);
    navigate(`/opportunity/${opportunity.id}/subscribers`);
  };

  const subscribeLabel = toggleSubscriber.isPending
    ? "Processando..."
    : isSubscribed
      ? "Cancelar candidatura"
      : isSubscriptionClosed
        ? "Prazo encerrado"
        : "Candidatar-se";

  const subscribeDetailLabel = toggleSubscriber.isPending
    ? "Processando..."
    : isSubscribed
      ? "Cancelar candidatura"
      : isSubscriptionClosed
        ? "Prazo encerrado"
        : "Candidatar-se para esta oportunidade";

  const subscribeButtonVariant = isSubscriptionClosed
    ? "secondary"
    : isSubscribed
      ? "destructive"
      : "default";

  if (!commentDesktop) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="mt-0 flex h-[100vh] flex-col data-[vaul-drawer-direction=bottom]:max-h-[100vh]">
          <DrawerHeader className="flex-shrink-0 px-6 pt-4">
            <DrawerClose className="absolute right-4 rounded-sm transition-opacity">
              <CloseIcon className="h-5 w-5" />
            </DrawerClose>
            <DrawerTitle>Detalhes da oportunidade</DrawerTitle>
            <DrawerDescription>
              Veja os detalhes da vaga e acompanhe suas candidaturas.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex w-full flex-col items-center overflow-y-auto px-4 py-6">
            <div className="mb-6 w-full max-w-[45em]">
              <div className="mb-4 flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={opportunity.company?.profileImg} />
                  <AvatarFallback>{companyInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{opportunity.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {companyName} - Publicado ha{" "}
                    {getTimeAgo(opportunity.createdAt)}
                    {opportunity.updatedAt &&
                    opportunity.updatedAt !== opportunity.createdAt ? (
                      <span>{` · Atualizado há ${getTimeAgo(opportunity.updatedAt)}`}</span>
                    ) : null}
                  </p>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {opportunity.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {opportunityDate}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {subscribersCount}{" "}
                  {subscribersCount === 1 ? "candidato" : "candidatos"}
                </div>
              </div>

              {opportunity.skills?.length ? (
                <div className="mb-6 flex flex-wrap gap-2">
                  {opportunity.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <div className="prose prose-sm max-w-none">
                <h3 className="mb-2 text-lg font-semibold">Descricao</h3>
                <p className="whitespace-pre-wrap">{opportunity.description}</p>
              </div>
            </div>

            {!isOwner && isAthlete ? (
              <div className="w-full max-w-[45em] border-t pt-4">
                <Button
                  onClick={handleApply}
                  className="w-full"
                  disabled={toggleSubscriber.isPending || isSubscriptionClosed}
                  variant={subscribeButtonVariant}
                >
                  {subscribeLabel}
                </Button>
              </div>
            ) : null}

            {isOwner ? (
              <div className="w-full max-w-[45em] border-t pt-4">
                <Button
                  variant="outline"
                  onClick={handleViewSubscribers}
                  className="w-full"
                >
                  Ver inscritos ({subscribersCount})
                </Button>
              </div>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[90vw] max-w-4xl overflow-hidden rounded-xl p-0">
        <DialogDescription className="sr-only">
          Veja os detalhes da vaga e acompanhe suas candidaturas.
        </DialogDescription>

        <div className="flex h-full w-full">
          <div className="flex w-full flex-col">
            <div className="flex gap-3 border-b bg-card p-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src={opportunity.company?.profileImg} />
                <AvatarFallback>{companyInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold">{opportunity.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {companyName} - Publicado ha{" "}
                  {getTimeAgo(opportunity.createdAt)}
                  {opportunity.updatedAt &&
                  opportunity.updatedAt !== opportunity.createdAt ? (
                    <span>{` · Atualizado há ${getTimeAgo(opportunity.updatedAt)}`}</span>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
              <div className="mb-6 flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{opportunity.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{opportunityDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {subscribersCount}{" "}
                    {subscribersCount === 1 ? "candidato" : "candidatos"}
                  </span>
                </div>
              </div>

              {opportunity.skills?.length ? (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold">
                    Habilidades necessarias
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-semibold">Descricao</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
                </div>
              </div>
            </div>

            {!isOwner && isAthlete ? (
              <div className="border-t p-6">
                <Button
                  onClick={handleApply}
                  className="w-full"
                  disabled={toggleSubscriber.isPending || isSubscriptionClosed}
                  variant={subscribeButtonVariant}
                >
                  {subscribeDetailLabel}
                </Button>
              </div>
            ) : null}

            {isOwner ? (
              <div className="border-t p-6">
                <Button
                  variant="outline"
                  onClick={handleViewSubscribers}
                  className="w-full"
                >
                  Ver inscritos ({subscribersCount})
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
