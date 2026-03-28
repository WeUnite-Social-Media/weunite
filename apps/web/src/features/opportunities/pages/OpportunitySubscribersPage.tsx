import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Loader2, MapPin, Users } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { OpportunitySubscribers } from "@/features/opportunities/components/OpportunitySubscribers";
import { useGetOpportunity } from "@/features/opportunities/state/useOpportunities";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { getTimeAgo } from "@/shared/hooks/useGetTimeAgo";
import { getInitials } from "@/shared/utils/getInitials";

export function OpportunitySubscribersPage() {
  const navigate = useNavigate();
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const { user } = useAuthStore();

  const opportunityIdNumber = Number(opportunityId);
  const { data, isLoading } = useGetOpportunity(opportunityIdNumber, {
    enabled: opportunityIdNumber > 0,
  });

  const opportunity = data?.data ?? null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando candidatos...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold">Oportunidade não encontrada</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = opportunity.company?.id === user?.id;

  if (!isOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-lg font-semibold">Acesso negado</p>
          <p className="mb-4 text-muted-foreground">
            Apenas o dono da oportunidade pode visualizar os inscritos.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const companyInitials = getInitials(
    opportunity.company?.name || opportunity.company?.username || "",
  );
  const subscribersCount =
    opportunity.subscribersCount ?? opportunity.subscribers?.length ?? 0;

  return (
    <div className="flex justify-center pt-4">
      <div className="w-full max-w-[45em] px-4 pb-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={opportunity.company?.profileImg} />
                <AvatarFallback>{companyInitials}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <CardTitle className="mb-2 text-2xl">
                  {opportunity.title}
                </CardTitle>
                <p className="mb-3 text-sm text-muted-foreground">
                  {opportunity.company?.username || opportunity.company?.name} • Publicado há{" "}
                  {getTimeAgo(opportunity.createdAt)}
                </p>

                <div className="mb-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Até {new Date(opportunity.dateEnd).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {subscribersCount} inscrito{subscribersCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                {opportunity.skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {opportunity.skills.map((skill: { id: number; name: string }) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </CardHeader>

          {opportunity.description ? (
            <CardContent>
              <h2 className="mb-2 text-lg font-semibold">Descrição</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {opportunity.description}
              </p>
            </CardContent>
          ) : null}
        </Card>

        <OpportunitySubscribers opportunityId={opportunityIdNumber} />
      </div>
    </div>
  );
}
