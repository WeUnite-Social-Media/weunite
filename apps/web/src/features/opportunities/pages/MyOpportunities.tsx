import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import OpportunityDetailModal from "@/features/opportunities/components/OpportunityDetailModal";
import {
  useGetAthleteSubscriptions,
  useGetOpportunitiesCompany,
} from "@/features/opportunities/state/useOpportunities";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import type { Opportunity } from "@/shared/types/opportunity.types";

export function MyOpportunities() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoints();
  const { user } = useAuthStore();
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const isCompany = user?.role === "company";
  const isAthlete = user?.role === "athlete";

  const {
    data: companyOpportunitiesResponse,
    fetchNextPage: fetchNextCompanyOpportunitiesPage,
    hasNextPage: hasNextCompanyOpportunitiesPage,
    isFetchingNextPage: isFetchingNextCompanyOpportunitiesPage,
    isLoading: isLoadingCompanyOpportunities,
  } = useGetOpportunitiesCompany(Number(user?.id), {
    enabled: Boolean(user?.id) && isCompany,
  });

  const {
    data: athleteSubscriptionsResponse,
    fetchNextPage: fetchNextAthleteSubscriptionsPage,
    hasNextPage: hasNextAthleteSubscriptionsPage,
    isFetchingNextPage: isFetchingNextAthleteSubscriptionsPage,
    isLoading: isLoadingAthleteSubscriptions,
  } = useGetAthleteSubscriptions(Number(user?.id), {
    enabled: Boolean(user?.id) && isAthlete,
  });

  const isLoading =
    isLoadingCompanyOpportunities || isLoadingAthleteSubscriptions;

  const companyOpportunities = useMemo<Opportunity[]>(
    () =>
      companyOpportunitiesResponse?.pages.flatMap(
        (page) => (page.data ?? []) as Opportunity[],
      ) ?? [],
    [companyOpportunitiesResponse],
  );
  const athleteOpportunities = useMemo<Opportunity[]>(
    () =>
      athleteSubscriptionsResponse?.pages.flatMap(
        (page) => (page.data ?? []) as Opportunity[],
      ) ?? [],
    [athleteSubscriptionsResponse],
  );
  const opportunities = isCompany ? companyOpportunities : athleteOpportunities;
  const hasNextPage = isCompany
    ? hasNextCompanyOpportunitiesPage
    : hasNextAthleteSubscriptionsPage;
  const isFetchingNextPage = isCompany
    ? isFetchingNextCompanyOpportunitiesPage
    : isFetchingNextAthleteSubscriptionsPage;
  const fetchNextPage = isCompany
    ? fetchNextCompanyOpportunitiesPage
    : fetchNextAthleteSubscriptionsPage;

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, opportunities.length]);

  const handleViewDetails = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center pt-4">
        <div className="w-full max-w-[45em] px-4 py-8">
          <div className="mb-8">
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>

          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-56 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!opportunities.length) {
    return (
      <div className="flex justify-center pt-4">
        <div className="w-full max-w-3xl px-4 py-8 pb-[5em]">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {isCompany ? "Minhas oportunidades" : "Minhas candidaturas"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isCompany
                ? "Gerencie suas oportunidades e acompanhe quem se inscreveu."
                : "Acompanhe as oportunidades para as quais você já se candidatou."}
            </p>
          </div>

          <Card className="border-2 border-dashed">
            <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-12 text-center">
              {isCompany ? (
                <Briefcase className="mb-6 h-20 w-20 text-muted-foreground/30" />
              ) : (
                <UserCheck className="mb-6 h-20 w-20 text-muted-foreground/30" />
              )}
              <h2 className="mb-3 text-2xl font-semibold">
                {isCompany
                  ? "Você ainda não criou nenhuma oportunidade"
                  : "Você ainda não se candidatou a nenhuma oportunidade"}
              </h2>
              <p className="max-w-xl text-muted-foreground">
                {isCompany
                  ? "Crie sua primeira oportunidade para começar a receber candidaturas."
                  : "Explore as oportunidades disponíveis e candidate-se às que combinam com você."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-4">
      <div className="w-full max-w-[45em] px-4 py-8 pb-[5em]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {isCompany ? "Minhas oportunidades" : "Minhas candidaturas"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isCompany
              ? "Gerencie suas oportunidades e acompanhe os inscritos."
              : "Revise as oportunidades para as quais você já enviou candidatura."}
          </p>
        </div>

        <div className="grid gap-4">
          {opportunities.map((opportunity: Opportunity) => {
            const subscribersCount =
              opportunity.subscribersCount ??
              opportunity.subscribers?.length ??
              0;

            return (
              <Card
                key={opportunity.id}
                className="transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {opportunity.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {opportunity.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {isAthlete && opportunity.company ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span className="truncate">
                        {opportunity.company.username ||
                          opportunity.company.name}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{opportunity.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Prazo:{" "}
                      {new Date(opportunity.dateEnd).toLocaleDateString(
                        "pt-BR",
                      )}
                    </span>
                  </div>

                  {opportunity.skills?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill.id} variant="secondary">
                          {skill.name}
                        </Badge>
                      ))}
                      {opportunity.skills.length > 3 ? (
                        <Badge variant="secondary">
                          +{opportunity.skills.length - 3}
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="border-t pt-4">
                    {isCompany ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Candidaturas
                          </span>
                          <span className="font-medium">
                            {subscribersCount}
                          </span>
                        </div>

                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/opportunity/${opportunity.id}/subscribers`,
                            )
                          }
                          disabled={subscribersCount === 0}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Ver inscritos
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleViewDetails(opportunity)}
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {hasNextPage ? (
            <div
              ref={loadMoreRef}
              className="py-4 text-center text-sm text-muted-foreground"
            >
              {isFetchingNextPage ? "Carregando..." : null}
            </div>
          ) : null}
        </div>

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
