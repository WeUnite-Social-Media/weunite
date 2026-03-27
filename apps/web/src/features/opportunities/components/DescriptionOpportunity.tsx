import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import type { Opportunity } from "@/shared/types/opportunity.types";
import { X as CloseIcon, MapPin, Calendar, Users } from "lucide-react";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { getInitials } from "@/shared/utils/getInitials";
import { getTimeAgo } from "@/shared/hooks/useGetTimeAgo";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  useCheckIsSubscribed,
  useToggleSubscriber,
} from "@/features/opportunities/state/useOpportunities";
import { useNavigate } from "react-router-dom";
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
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toggleSubscriber = useToggleSubscriber();

  const companyInitials = getInitials(opportunity.company?.name || "");

  const { commentDesktop } = useBreakpoints();
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

  const opportunityDate = new Date(opportunity.dateEnd).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );

  const isExpired = (() => {
    const deadline = new Date(opportunity.dateEnd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today;
  })();

  const handleApply = () => {
    if (!user?.id || !isAthlete || toggleSubscriber.isPending) {
      return;
    }

    if (isExpired) {
      toast.error("O prazo desta oportunidade já expirou.");
      return;
    }

    toggleSubscriber.mutate({
      athleteId: Number(user.id),
      opportunityId: Number(opportunity.id),
    });
  };

  if (!commentDesktop) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[100vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh] mt-0 flex flex-col">
          <DrawerHeader className="pt-4 px-6 flex-shrink-0">
            <DrawerClose className="absolute rounded-sm transition-opacity right-4">
              <CloseIcon className="h-5 w-5 hover:cursor-pointer" />
            </DrawerClose>
            <DrawerTitle>Detalhes da Oportunidade</DrawerTitle>
            <DrawerDescription>
              Veja os detalhes da vaga e acompanhe suas candidaturas.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col w-full items-center overflow-y-auto px-4 py-6">
            {/* Cabeçalho da oportunidade */}
            <div className="w-full max-w-[45em] mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={opportunity.company?.profileImg} />
                  <AvatarFallback>{companyInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{opportunity.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {opportunity.company?.name} • Publicado há{" "}
                    {getTimeAgo(opportunity.createdAt)}
                  </p>
                </div>
              </div>

              {/* Informações básicas */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
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
                  {subscribersCount} candidatos
                </div>
              </div>

              {/* Habilidades */}
              <div className="flex flex-wrap gap-2 mb-6">
                {opportunity.skills?.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>

              {/* Descrição */}
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="whitespace-pre-wrap">{opportunity.description}</p>
              </div>
            </div>

            {/* Botão de candidatura */}
            {!isOwner && isAthlete ? (
              <div className="w-full max-w-[45em] border-t pt-4">
                <Button
                  onClick={handleApply}
                  className="w-full"
                  disabled={toggleSubscriber.isPending || isExpired}
                >
                  {toggleSubscriber.isPending
                    ? "Processando..."
                    : isSubscribed
                      ? "Cancelar candidatura"
                      : "Candidatar-se"}
                </Button>
              </div>
            ) : null}

            {isOwner ? (
              <div className="w-full max-w-[45em] border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange?.(false);
                    navigate(`/opportunity/${opportunity.id}/subscribers`);
                  }}
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
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0 rounded-xl overflow-hidden">
        <DialogDescription className="sr-only">
          Veja os detalhes da vaga e acompanhe suas candidaturas.
        </DialogDescription>
        <div className="flex w-full h-full">
          <div className="w-full flex flex-col">
            {/* Cabeçalho */}
            <div className="p-6 border-b flex gap-3 bg-card">
              <Avatar className="h-12 w-12">
                <AvatarImage src={opportunity.company?.profileImg} />
                <AvatarFallback>{companyInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold">{opportunity.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {opportunity.company?.name} • Publicado há{" "}
                  {getTimeAgo(opportunity.createdAt)}
                </p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {/* Informações básicas */}
              <div className="flex flex-wrap gap-6 mb-6 text-sm">
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
                  <span>{subscribersCount} candidatos</span>
                </div>
              </div>

              {/* Habilidades */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Habilidades necessárias
                </h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills?.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer com botão de candidatura */}
            {!isOwner && isAthlete ? (
              <div className="border-t p-6">
                <Button
                  onClick={handleApply}
                  className="w-full"
                  disabled={toggleSubscriber.isPending || isExpired}
                >
                  {toggleSubscriber.isPending
                    ? "Processando..."
                    : isSubscribed
                      ? "Cancelar candidatura"
                      : "Candidatar-se para esta oportunidade"}
                </Button>
              </div>
            ) : null}

            {isOwner ? (
              <div className="border-t p-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange?.(false);
                    navigate(`/opportunity/${opportunity.id}/subscribers`);
                  }}
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
