import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Lightbulb } from "lucide-react";
import CardSuggestionOpportunity from "@/components/opportunity/CardSuggestionOpportunity";
import { useGetOpportunities } from "@/state/useOpportunities";
import { Skeleton } from "@/components/ui/skeleton";

const useCustomBreakpoint = (breakpoint: number = 1500) => {
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
  const [randomizedOpportunities, setRandomizedOpportunities] = useState<any[]>(
    [],
  );
  const [displayCount, setDisplayCount] = useState(4);

  const isDesktop = useCustomBreakpoint(1500);

  // Buscar todas as oportunidades
  const { data: opportunitiesData, isLoading } = useGetOpportunities();

  const allOpportunities = Array.isArray(opportunitiesData?.data)
    ? opportunitiesData.data
    : [];

  // Randomizar apenas uma vez quando os dados carregam
  useEffect(() => {
    if (opportunitiesData?.success && opportunitiesData?.data) {
      const opportunities = Array.isArray(opportunitiesData.data)
        ? opportunitiesData.data
        : [];

      // Só randomiza se a lista ainda não foi criada ou se o tamanho mudou significativamente
      if (
        randomizedOpportunities.length === 0 ||
        Math.abs(opportunities.length - randomizedOpportunities.length) > 2
      ) {
        // Criar cópia e embaralhar todas as oportunidades
        const shuffled = [...opportunities].sort(() => Math.random() - 0.5);
        setRandomizedOpportunities(shuffled);
      }
    }
  }, [opportunitiesData]);

  const randomOpportunities = randomizedOpportunities.slice(0, displayCount);
  const hasMoreOpportunities = displayCount < randomizedOpportunities.length;

  const handleShowMore = () => {
    if (!showAll) {
      setShowAll(true);
      setVisibleOpportunities(randomOpportunities.length);
    } else {
      // Carregar mais 4 oportunidades
      setDisplayCount((prev) =>
        Math.min(prev + 4, randomizedOpportunities.length),
      );
    }
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

  const OpportunitiesContent = () => (
    <>
      {showAll && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">
            Mostrando {displayedOpportunities.length} de{" "}
            {randomizedOpportunities.length}
          </span>
          <button
            onClick={handleClose}
            className="text-sm text-third font-medium bg-transparent hover:cursor-pointer hover:bg-transparent"
          >
            Fechar
          </button>
        </div>
      )}

      <div className="space-y-4 justify-end">
        {isLoading ? (
          // Loading state
          Array.from({ length: visibleOpportunities }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ))
        ) : displayedOpportunities.length > 0 ? (
          displayedOpportunities.map((opportunity) => (
            <CardSuggestionOpportunity
              key={opportunity.id}
              opportunity={opportunity}
              isMobile={!isDesktop}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhuma oportunidade disponível no momento
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {!showAll && randomOpportunities.length > 1 && (
          <div className="flex justify-end">
            <button
              onClick={handleShowMore}
              className="text-sm text-third font-medium duration-200 bg-transparent hover:cursor-pointer hover:bg-hover-button py-1 px-2 rounded"
            >
              Ver Outras
            </button>
          </div>
        )}

        {showAll && hasMoreOpportunities && (
          <button
            onClick={handleShowMore}
            className="w-full text-sm text-third font-medium duration-200 bg-transparent hover:cursor-pointer hover:bg-hover-button py-2 px-4 rounded border border-third/20"
          >
            Mostrar Mais Oportunidades
          </button>
        )}

        {showAll && !hasMoreOpportunities && allOpportunities.length > 0 && (
          <p className="text-xs text-center text-muted-foreground py-2">
            Todas as oportunidades foram carregadas
          </p>
        )}
      </div>
    </>
  );

  return (
    <>
      {isDesktop && (
        <div className="fixed right-0 top-0 h-screen w-[20vw] z-30 pointer-events-none mr-6 bg-background">
          <div className="flex items-center justify-center mb-2 mt-6">
            <h2 className="text-lg font-semibold text-sidebar-foreground ml-2">
              Sugestões de oportunidade
            </h2>
          </div>
          <div className="flex-1 h-full overflow-y-auto pointer-events-auto">
            <OpportunitiesContent />
          </div>
        </div>
      )}

      {!isDesktop && (
        <div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-[60] bg-primary hover:bg-primary/90 hover:cursor-pointer pointer-events-auto"
                aria-label="Abrir sugestões de oportunidade"
              >
                <Lightbulb className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[70vw] sm:w-[700px] max-w-[800px]"
            >
              <SheetHeader className="mb-6">
                <SheetTitle>Sugestões de oportunidade</SheetTitle>
                <SheetDescription>
                  Descubra novas oportunidades que podem interessar você
                </SheetDescription>
              </SheetHeader>

              <div
                className="overflow-y-auto h-[calc(100vh-8rem)] px-4"
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
                <div className="max-w-sm mx-auto space-y-4">
                  <OpportunitiesContent />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  );
};
