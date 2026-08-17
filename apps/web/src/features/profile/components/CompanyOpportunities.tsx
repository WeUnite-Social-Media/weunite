import { useEffect, useMemo, useRef } from "react";
import { BriefcaseBusiness, CircleAlert, Loader2 } from "lucide-react";
import OpportunityCard from "@/features/opportunities/components/OpportunityCard";
import { useGetOpportunitiesCompany } from "@/features/opportunities/state/useOpportunities";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { Opportunity } from "@/shared/types/opportunity.types";

interface CompanyOpportunitiesProps {
  companyId: number;
}

export default function CompanyOpportunities({
  companyId,
}: CompanyOpportunitiesProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = useGetOpportunitiesCompany(companyId, {
    enabled: companyId > 0,
  });
  const opportunities = useMemo(
    () => data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [data],
  );

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <ProfileCompanyState
        icon={CircleAlert}
        title="Nao foi possivel carregar as oportunidades"
        description="Tente novamente em instantes para ver as vagas deste perfil."
        tone="error"
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {opportunities.length > 0 ? (
        <>
          {opportunities.map((opportunity: Opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}

          {hasNextPage ? (
            <div
              ref={loadMoreRef}
              className="py-4 text-center text-sm text-muted-foreground"
            >
              {isFetchingNextPage ? "Carregando..." : null}
            </div>
          ) : null}
        </>
      ) : (
        <ProfileCompanyState
          icon={BriefcaseBusiness}
          title="Nenhuma oportunidade encontrada"
          description="Quando esta empresa publicar uma nova vaga, ela vai aparecer aqui."
        />
      )}
    </div>
  );
}

function ProfileCompanyState({
  description,
  icon: Icon,
  title,
  tone = "default",
}: {
  description: string;
  icon: typeof BriefcaseBusiness;
  title: string;
  tone?: "default" | "error";
}) {
  const toneClasses =
    tone === "error"
      ? "border-red-200/60 bg-red-50/60 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
      : "border-border/60 bg-card/70 text-primary";

  return (
    <Card className={`mt-6 w-full max-w-xl shadow-none ${toneClasses}`}>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
