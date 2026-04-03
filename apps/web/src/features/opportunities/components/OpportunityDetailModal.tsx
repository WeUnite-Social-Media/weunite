import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  useCheckIsSubscribed,
  useToggleSubscriber,
} from "@/features/opportunities/state/useOpportunities";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { getTimeAgo } from "@/shared/hooks/useGetTimeAgo";
import { getInitials } from "@/shared/utils/getInitials";
import type { Opportunity } from "@/shared/types/opportunity.types";
import { Calendar, Briefcase, MapPin, Tag, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface OpportunityDetailModalProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile?: boolean;
}

export default function OpportunityDetailModal({
  opportunity,
  isOpen,
  onOpenChange,
  isMobile = false,
}: OpportunityDetailModalProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toggleSubscriber = useToggleSubscriber();

  const isOwner = opportunity.company?.id === user?.id;
  const isAthlete = user?.role === "athlete";
  const subscribersCount =
    opportunity.subscribersCount ?? opportunity.subscribers?.length ?? 0;
  const companyName =
    opportunity.company?.name || opportunity.company?.username || "Empresa";
  const companyInitials = getInitials(companyName);

  const { data: isSubscribedData } = useCheckIsSubscribed(
    Number(user?.id),
    Number(opportunity.id),
    Boolean(user?.id) && isAthlete && !isOwner,
  );

  const isSubscribed = isSubscribedData?.data ?? false;

  const isExpired = (() => {
    const deadline = new Date(opportunity.dateEnd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today;
  })();

  const handleToggleSubscribe = () => {
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

  const handleViewSubscribers = () => {
    onOpenChange(false);
    navigate(`/opportunity/${opportunity.id}/subscribers`);
  };

  const opportunityDate = format(new Date(opportunity.dateEnd), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const content = (
    <div className="space-y-6">
      <div className="flex items-start gap-4 rounded-xl border bg-muted/20 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={opportunity.company?.profileImg} alt={companyName} />
          <AvatarFallback>{companyInitials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-2xl font-bold leading-tight">
            {opportunity.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{companyName}</span>
            {opportunity.createdAt ? (
              <>
                <span>•</span>
                <span>Publicado há {getTimeAgo(opportunity.createdAt)}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {opportunity.location ? (
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Localização</p>
              <p className="text-sm font-medium">{opportunity.location}</p>
            </div>
          </div>
        ) : null}

        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Data limite</p>
            <p className="text-sm font-medium">{opportunityDate}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Candidaturas</p>
            <p className="text-sm font-medium">
              {subscribersCount} {subscribersCount === 1 ? "candidato" : "candidatos"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-2 flex items-center gap-2 font-semibold">
          <Briefcase className="h-4 w-4" />
          <span>Descrição</span>
        </h4>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {opportunity.description}
        </p>
      </div>

      {opportunity.skills?.length ? (
        <div>
          <h4 className="mb-3 flex items-center gap-2 font-semibold">
            <Tag className="h-4 w-4" />
            <span>Habilidades requeridas</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {opportunity.skills.map((skill) => (
              <Badge key={skill.id} variant="secondary">
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {!isOwner && isAthlete ? (
        <div className="pt-2">
          <Button
            onClick={handleToggleSubscribe}
            disabled={toggleSubscriber.isPending || isExpired}
            className="w-full"
            size="lg"
            variant={isSubscribed ? "outline" : "default"}
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
        <div className="pt-2">
          <Button
            onClick={handleViewSubscribers}
            className="w-full"
            size="lg"
            variant="outline"
          >
            Ver inscritos ({subscribersCount})
          </Button>
        </div>
      ) : null}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader className="mb-6 text-left">
            <SheetTitle>Detalhes da oportunidade</SheetTitle>
            <SheetDescription>
              Veja todas as informações sobre esta oportunidade.
            </SheetDescription>
          </SheetHeader>
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto pr-2">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da oportunidade</DialogTitle>
          <DialogDescription>
            Veja todas as informações sobre esta oportunidade.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
