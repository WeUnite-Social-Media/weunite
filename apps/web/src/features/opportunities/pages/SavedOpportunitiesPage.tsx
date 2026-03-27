import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  Briefcase,
  Calendar,
  Loader2,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useGetSavedOpportunities } from "@/features/opportunities/state/useOpportunities";
import type { Opportunity } from "@/shared/types/opportunity.types";
import OpportunityDetailModal from "@/features/opportunities/components/OpportunityDetailModal";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";

export function SavedOpportunitiesPage() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoints();
  const { user } = useAuthStore();
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data, isLoading } = useGetSavedOpportunities(Number(user?.id), {
    enabled: Boolean(user?.id) && user?.role === "athlete",
  });

  const savedOpportunities = (data?.data ?? []) as Opportunity[];

  const handleViewDetails = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailOpen(true);
  };

  if (user?.role !== "athlete") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-8">
        <Card className="w-full">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Apenas atletas podem salvar oportunidades.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-4">
      <div className="w-full max-w-[45em] px-4 py-8 pb-[5em]">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Oportunidades Salvas</h1>
          </div>
          <p className="text-muted-foreground">
            {savedOpportunities.length} oportunidade
            {savedOpportunities.length === 1 ? "" : "s"} salva
            {savedOpportunities.length === 1 ? "" : "s"}
          </p>
        </div>

        {savedOpportunities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bookmark className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-semibold">
                Nenhuma oportunidade salva ainda
              </h2>
              <p className="mb-6 text-muted-foreground">
                Salve oportunidades para revisitá-las com mais facilidade.
              </p>
              <Button onClick={() => navigate("/opportunity")}>
                Explorar oportunidades
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {savedOpportunities.map((opportunity: Opportunity) => (
              <Card key={opportunity.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <CardTitle className="line-clamp-2 text-lg">
                      {opportunity.title}
                    </CardTitle>
                    <Bookmark className="h-5 w-5 shrink-0 fill-primary text-primary" />
                  </div>

                  {opportunity.company ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span className="truncate">{opportunity.company.name}</span>
                    </div>
                  ) : null}
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {opportunity.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    {opportunity.location ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{opportunity.location}</span>
                      </div>
                    ) : null}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Até {format(new Date(opportunity.dateEnd), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>

                  {opportunity.skills?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skills.slice(0, 3).map((skill: { id: number; name: string }) => (
                        <span
                          key={skill.id}
                          className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {opportunity.skills.length > 3 ? (
                        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                          +{opportunity.skills.length - 3}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleViewDetails(opportunity)}
                  >
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedOpportunity ? (
          <OpportunityDetailModal
            opportunity={selectedOpportunity}
            isOpen={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            isMobile={isMobile}
          />
        ) : null}
      </div>
    </div>
  );
}
