import React, { useEffect, useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import CardSuggestionOpportunity from "@/features/opportunities/components/CardSuggestionOpportunity";
import { useGetOpportunities } from "@/features/opportunities/state/useOpportunities";
import type { Opportunity } from "@/shared/types/opportunity.types";

const useCustomBreakpoint = (breakpoint = 1500) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [breakpoint]);

  return isDesktop;
};

export const OpportunitiesSidebar: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const [visibleOpportunities, setVisibleOpportunities] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [randomizedOpportunities, setRandomizedOpportunities] = useState<
    Opportunity[]
  >([]);
  const [displayCount, setDisplayCount] = useState(4);

  const isDesktop = useCustomBreakpoint(1500);
  const {
    data: opportunitiesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetOpportunities();

  const allOpportunities = useMemo(
    () => opportunitiesData?.pages.flatMap((page) => page.data ?? []) ?? [],
    [opportunitiesData],
  );

  useEffect(() => {
    if (allOpportunities.length === 0) {
      return;
    }

    setRandomizedOpportunities((current) => {
      if (
        current.length > 0 &&
        Math.abs(allOpportunities.length - current.length) <= 2
      ) {
        return current;
      }

      return [...allOpportunities].sort(() => Math.random() - 0.5);
    });
  }, [allOpportunities]);

  const randomOpportunities = randomizedOpportunities.slice(0, displayCount);
  const hasMoreOpportunities = displayCount < randomizedOpportunities.length;

  const handleShowMore = async () => {
    if (!showAll) {
      setShowAll(true);
      setVisibleOpportunities(randomOpportunities.length);
      return;
    }

    if (
      displayCount >= randomizedOpportunities.length &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      await fetchNextPage();
    }

    setDisplayCount((previous) =>
      Math.min(previous + 4, randomizedOpportunities.length),
    );
  };

  const handleClose = () => {
    setShowAll(false);
    setVisibleOpportunities(1);
    setDisplayCount(4);
  };

  const displayedOpportunities = randomOpportunities.slice(
    0,
    visibleOpportunities,
  );

  const opportunitiesContent = (
    <>
      {showAll && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Mostrando {displayedOpportunities.length} de{" "}
            {randomizedOpportunities.length}
          </span>
          <button
            onClick={handleClose}
            className="bg-transparent text-sm font-medium text-third hover:cursor-pointer hover:bg-transparent"
          >
            Fechar
          </button>
        </div>
      )}

      <div className="space-y-4 justify-end">
        {isLoading ? (
          Array.from({ length: visibleOpportunities }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ))
        ) : displayedOpportunities.length > 0 ? (
          displayedOpportunities.map((opportunity) => (
            <CardSuggestionOpportunity
              key={opportunity.id}
              opportunity={opportunity}
            />
          ))
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma oportunidade disponivel no momento
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {!showAll && randomOpportunities.length > 1 && (
          <div className="flex justify-end">
            <button
              onClick={handleShowMore}
              className="rounded bg-transparent px-2 py-1 text-sm font-medium text-third duration-200 hover:cursor-pointer hover:bg-hover-button"
            >
              Ver Outras
            </button>
          </div>
        )}

        {showAll && (hasMoreOpportunities || hasNextPage) && (
          <button
            onClick={handleShowMore}
            disabled={isFetchingNextPage}
            className="w-full rounded border border-third/20 bg-transparent px-4 py-2 text-sm font-medium text-third duration-200 hover:cursor-pointer hover:bg-hover-button"
          >
            {isFetchingNextPage
              ? "Carregando..."
              : "Mostrar Mais Oportunidades"}
          </button>
        )}

        {showAll &&
          !hasMoreOpportunities &&
          !hasNextPage &&
          allOpportunities.length > 0 && (
            <p className="py-2 text-center text-xs text-muted-foreground">
              Todas as oportunidades foram carregadas
            </p>
          )}
      </div>
    </>
  );

  return (
    <>
      {isDesktop && (
        <div className="pointer-events-none fixed right-0 top-0 z-30 h-screen w-[20vw] bg-background mr-6">
          <div className="mb-2 mt-6 flex items-center justify-center">
            <h2 className="ml-2 text-lg font-semibold text-sidebar-foreground">
              Sugestoes de oportunidade
            </h2>
          </div>
          <div className="pointer-events-auto h-full flex-1 overflow-y-auto">
            {opportunitiesContent}
          </div>
        </div>
      )}

      {!isDesktop && (
        <div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="pointer-events-auto fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-primary shadow-lg hover:cursor-pointer hover:bg-primary/90"
                aria-label="Abrir sugestoes de oportunidade"
              >
                <Lightbulb className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[70vw] max-w-[800px] sm:w-[700px]"
            >
              <SheetHeader className="mb-6">
                <SheetTitle>Sugestoes de oportunidade</SheetTitle>
                <SheetDescription>
                  Descubra novas oportunidades que podem interessar voce
                </SheetDescription>
              </SheetHeader>

              <div
                className="h-[calc(100vh-8rem)] overflow-y-auto px-4"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <style>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="mx-auto max-w-sm space-y-4">
                  {opportunitiesContent}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  );
};
