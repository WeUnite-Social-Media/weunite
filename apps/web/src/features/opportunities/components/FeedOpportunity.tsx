import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useGetOpportunities } from "@/features/opportunities/state/useOpportunities";
import type { Opportunity } from "@/shared/types/opportunity.types";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import { CreateOpportunity } from "./CreateOpportunity";
import { HorizontalMenuOpportunity } from "./HorizontalMenuOpportunity";
import OpportunityCard from "./OpportunityCard";
import OpportunitySearch from "./OpportunitySearch";
import { OpportunitySidebar } from "./OpportunitySidebar";
import OpportunitySuggestionCarousel from "./OpportunitySuggestionCarousel";

function OpportunitySkeleton() {
  return (
    <div className="mb-3 w-full max-w-[500px] rounded-xl border bg-card p-4">
      <div className="mb-4 flex items-center space-x-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      <div className="mb-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-18 rounded-full" />
      </div>

      <div className="flex justify-between border-t pt-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

export default function FeedOpportunity() {
  const { data, isLoading } = useGetOpportunities();
  const opportunities = data?.data;
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpportunityOpen, setIsCreateOpportunityOpen] = useState(false);
  const { isDesktop, isMobile, isTablet } = useBreakpoints();
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex w-full justify-center">
        {!isMobile && !isTablet ? <OpportunitySidebar /> : null}
        <div className="flex w-full max-w-[600px] flex-col items-center">
          {Array.from({ length: 3 }).map((_, index) => (
            <OpportunitySkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <>
        <div className="flex w-full justify-center pt-4">
          <div className="flex w-full max-w-[600px] flex-col items-center gap-2">
            <div className="flex w-full flex-col items-start justify-between gap-4">
              <OpportunitySearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <OpportunitySidebar />
            </div>

            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="space-y-3 text-center">
                <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">
                  Nenhuma oportunidade disponível
                </p>
                <p className="text-sm text-muted-foreground">
                  Seja a primeira empresa a publicar uma oportunidade.
                </p>
              </div>
            </div>
          </div>
        </div>

        {!isDesktop && user?.role === "company" ? (
          <Button
            onClick={() => setIsCreateOpportunityOpen(true)}
            className="fixed bottom-20 right-6 z-[60] h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        ) : null}

        <CreateOpportunity
          open={isCreateOpportunityOpen}
          onOpenChange={setIsCreateOpportunityOpen}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex w-full justify-center pt-4">
        <div className="flex w-full max-w-[45em] flex-col items-center gap-2">
          <div className="flex w-full flex-col items-end gap-2">
            <OpportunitySearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            {isDesktop ? <OpportunitySidebar /> : <HorizontalMenuOpportunity />}
          </div>

          {opportunities.length > 0 ? (
            <OpportunitySuggestionCarousel opportunities={opportunities} />
          ) : null}

          {opportunities.map((opportunity: Opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      </div>

      {!isDesktop && user?.role === "company" ? (
        <Button
          onClick={() => setIsCreateOpportunityOpen(true)}
          className="fixed bottom-20 right-6 z-[10] h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      ) : null}

      <CreateOpportunity
        open={isCreateOpportunityOpen}
        onOpenChange={setIsCreateOpportunityOpen}
      />
    </>
  );
}
