import OpportunitySuggestionCard from "./OpportunitySuggestionCard";
import type { Opportunity } from "@/@types/opportunity.types";

interface OpportunitySuggestionCarouselProps {
  opportunities: Opportunity[];
}

export default function OpportunitySuggestionCarousel({
  opportunities,
}: OpportunitySuggestionCarouselProps) {
  return (
    <div className="bg-background pb-4  pt-4 pl-1 rounded-lg w-full">
      <h2>Oportunidades Sugestões</h2>
      <div
        className="flex flex-row gap-3 overflow-x-auto mt-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {opportunities.map((opportunity) => (
          <OpportunitySuggestionCard
            key={opportunity.id}
            opportunity={opportunity}
          />
        ))}
      </div>
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
