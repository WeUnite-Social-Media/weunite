import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Opportunity } from "@/@types/opportunity.types";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/utils/getInitials";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar } from "lucide-react";
import { OpportunityDescription } from "./DescriptionOpportunity";

interface CardSuggestionOpportunityProps {
  opportunity: Opportunity;
  isMobile?: boolean;
}

export default function CardSuggestionOpportunity({
  opportunity,
  isMobile = false,
}: CardSuggestionOpportunityProps) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleViewMore = () => {
    setIsDescriptionOpen(true);
  };

  const initials = getInitials(opportunity.company?.name);

  return (
    <>
      <Card
        className="w-[18em] h-[15em] flex-shrink-0 flex flex-col cursor-pointer"
        onClick={handleViewMore}
      >
        <CardHeader className="pb-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Avatar className="hover:cursor-pointer h-10 w-10">
              <AvatarImage
                src={opportunity.company?.profileImg}
                alt="company logo"
              />
              <AvatarFallback className="bg-third/10 text-third font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-white truncate font-medium">
              {opportunity.company?.name}
            </p>
          </div>

          <CardTitle className="text-sidebar-foreground font-semibold text-sm line-clamp-2">
            {truncateText(opportunity.title, 30)}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-2 pb-3">
          {/* Skills - Duas qualidades */}
          <div className="flex items-center gap-1">
            {opportunity.skills?.slice(0, 2).map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="text-xs flex-shrink-0"
              >
                {skill.name}
              </Badge>
            ))}
            {opportunity.skills && opportunity.skills.length > 2 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{opportunity.skills.length - 2}
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{opportunity.location}</span>
          </div>

          {/* Date and Candidates - Lado a lado padronizado */}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mt-auto pt-2">
            <div className="flex items-center gap-1 flex-1">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {new Date(opportunity.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-1 justify-end">
              <Users className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{opportunity.subscribers?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <OpportunityDescription
        isOpen={isDescriptionOpen}
        onOpenChange={setIsDescriptionOpen}
        opportunity={opportunity}
      />
    </>
  );
}
