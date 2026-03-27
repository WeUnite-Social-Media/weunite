import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useGetOpportunitySubscribers } from "@/features/opportunities/state/useOpportunities";
import type { Subscriber } from "@/shared/types/opportunity.types";
import { ExternalLink, Loader2, Mail, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getInitials } from "@/shared/utils/getInitials";

interface OpportunitySubscribersProps {
  opportunityId?: number;
  subscribers?: Subscriber[];
}

export function OpportunitySubscribers({
  opportunityId,
  subscribers: subscribersProp,
}: OpportunitySubscribersProps) {
  const navigate = useNavigate();
  const { data, isLoading } = useGetOpportunitySubscribers(
    opportunityId || 0,
    Boolean(opportunityId) && !subscribersProp,
  );

  const subscribers = subscribersProp ?? data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando candidatos...</p>
      </div>
    );
  }

  if (subscribers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="mb-4 h-14 w-14 text-muted-foreground" />
        <p className="text-lg font-medium text-foreground">
          Nenhum atleta inscrito ainda
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          As candidaturas aparecerão aqui assim que os atletas se inscreverem.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {subscribers.map((subscriber) => {
        const athlete = subscriber.athlete;
        const athleteName = athlete?.name || "Atleta";
        const athleteUsername = athlete?.username || "atleta";
        const athleteProfilePath = athlete?.username
          ? `/profile/${athlete.username}`
          : "/profile";

        return (
          <Card key={subscriber.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={athlete?.profileImg} alt={athleteName} />
                  <AvatarFallback>
                    {getInitials(athleteUsername || athleteName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate font-semibold">{athleteName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    @{athleteUsername}
                  </p>
                  {athlete?.email ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{athlete.email}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate(athleteProfilePath)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver perfil
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
