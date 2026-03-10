import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGetOpportunities } from "@/state/useOpportunities";
import OpportunityCard from "./OpportunityCard";
import { HorizontalMenuOpportunity } from "./HorizontalMenuOpportunity";
import OpportunitySearch from "./OpportunitySearch";
import { CreateOpportunity } from "./CreateOpportunity";
import { useState } from "react";
import { useBreakpoints } from "@/hooks/useBreakpoints";
import { OpportunitySidebar } from "./OpportunitySidebar";
import type { Opportunity } from "@/@types/opportunity.types";
import { Plus } from "lucide-react";
import OpportunitySuggestionCarousel from "./OpportunitySuggestionCarousel";
import { useAuthStore } from "@/stores/useAuthStore";

function OpportunitySkeleton() {
  return (
    <div className="w-full max-w-[500px] mb-3 bg-card border rounded-xl p-4">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      <div className="flex gap-2 mb-4">
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
  const { isMobile, isTablet, isDesktop } = useBreakpoints();
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex justify-center w-full">
        {!isMobile && !isTablet && <OpportunitySidebar />}
        <div className="max-w-[600px] w-full flex flex-col items-center">
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
        <div className="flex justify-center w-full pt-4">
          <div className="max-w-[600px] w-full flex flex-col items-center gap-2">
            <div className="w-full flex flex-col justify-between items-start gap-4">
              <OpportunitySearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <OpportunitySidebar />
            </div>

            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="text-center space-y-3">
                <div className="text-4xl mb-4">🏢</div>
                <p className="text-muted-foreground text-lg font-medium">
                  Nenhuma oportunidade disponível
                </p>
                <p className="text-sm text-muted-foreground">
                  Seja o primeiro a criar uma oportunidade!
                </p>
              </div>
            </div>
          </div>
        </div>

        {!isDesktop && user?.role === "company" && (
          <Button
            onClick={() => setIsCreateOpportunityOpen(true)}
            className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-[60]"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        <CreateOpportunity
          open={isCreateOpportunityOpen}
          onOpenChange={setIsCreateOpportunityOpen}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-center w-full pt-4">
        <div className="max-w-[45em] w-full flex flex-col items-center gap-2">
          <div className="w-full flex flex-col gap-2 items-end">
            <OpportunitySearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            {isDesktop ? <OpportunitySidebar /> : <HorizontalMenuOpportunity />}
          </div>
          {opportunities && opportunities.length > 0 && (
            <OpportunitySuggestionCarousel opportunities={opportunities} />
          )}
          {opportunities.map((opportunity: Opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      </div>

      {!isDesktop && (
        <Button
          onClick={() => setIsCreateOpportunityOpen(true)}
          className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-[10]"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <CreateOpportunity
        open={isCreateOpportunityOpen}
        onOpenChange={setIsCreateOpportunityOpen}
      />
    </>
  );
}
