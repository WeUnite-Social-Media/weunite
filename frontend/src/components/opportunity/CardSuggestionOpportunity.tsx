import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Opportunity } from "@/@types/opportunity.types";
import { useState } from "react";
import OpportunityDetailModal from "./OpportunityDetailModal";

interface CardSuggestionOpportunityProps {
  opportunity: Opportunity;
  isMobile?: boolean;
}

export default function CardSuggestionOpportunity({
  opportunity,
  isMobile = false,
}: CardSuggestionOpportunityProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleViewMore = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className=" shadow-md transition-shadow duration-200 border-none w-full">
        <CardHeader className="pb-0">
          <CardTitle className="text-sidebar-foreground font-semibold text-sm sm:text-base line-clamp-2 mb-2">
            {truncateText(opportunity.title, 50)}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-sidebar-foreground line-clamp-3">
            {truncateText(opportunity.description, 100)}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-3">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-third bg-transparent hover:cursor-pointer hover:bg-hover-button"
              onClick={handleViewMore}
            >
              Ver Mais
            </Button>
          </div>
        </CardContent>
      </Card>

      <OpportunityDetailModal
        opportunity={opportunity}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        isMobile={isMobile}
      />
    </>
  );
}
