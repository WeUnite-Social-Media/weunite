import OpportunitySuggestionCard from "./OpportunitySuggestionCard";
import type { Opportunity } from "@/shared/types/opportunity.types";
import { useRef } from "react";

interface OpportunitySuggestionCarouselProps {
  opportunities: Opportunity[];
}

export default function OpportunitySuggestionCarousel({
  opportunities,
}: OpportunitySuggestionCarouselProps) {
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 4) {
      drag.moved = true;
      event.preventDefault();
    }

    event.currentTarget.scrollLeft = drag.scrollLeft - distance;
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;

    dragRef.current.pointerId = -1;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="bg-background pb-4  pt-4 pl-1 rounded-lg w-full">
      <h2>Oportunidades Sugestões</h2>
      <div
        className="flex flex-row gap-3 overflow-x-auto mt-4 cursor-grab select-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={(event) => {
          if (dragRef.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            dragRef.current.moved = false;
          }
        }}
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
