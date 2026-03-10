import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Bookmark,
  Share,
  EllipsisVertical,
  MapPin,
  Calendar,
  Users,
  Trash2,
  Flag,
  Edit,
} from "lucide-react";

import { getTimeAgo } from "@/hooks/useGetTimeAgo";

import { useState } from "react";
import { getInitials } from "@/utils/getInitials";
import { useNavigate } from "react-router-dom";
import { OpportunityDescription } from "./DescriptionOpportunity";
import { EditOpportunity } from "./EditOpportunity";
import type { Opportunity } from "@/@types/opportunity.types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDeleteOpportunity } from "@/state/useOpportunities";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const initials = getInitials(opportunity.company?.username || "");
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const deleteOpportunity = useDeleteOpportunity();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditOpportunityOpen, setIsEditOpportunityOpen] = useState(false);

  const timeAgo = getTimeAgo(opportunity.createdAt);

  const deadlineDate = new Date(opportunity.dateEnd).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );

  const isOwner = opportunity.company?.id === user?.id;

  const handleCompanyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwner) {
      navigate("/profile");
    } else {
      navigate(`/profile/${opportunity.company?.id}`);
    }
  };

  const handleDelete = () => {
    if (!user?.id) return;

    deleteOpportunity.mutate({
      companyId: Number(user.id),
      opportunityId: Number(opportunity.id),
    });

    setIsDeleteDialogOpen(false);
  };

  const handleEditOpportunityOpen = () => {
    setIsEditOpportunityOpen(true);
  };

  const handleCardClick = () => {
    setIsDescriptionOpen(true);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <Card
        className="w-full max-w-[45em] bg-card shadow-none border-0 rounded-none border-foreground/50 hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center gap-2 mb-[0.5em]">
          <Avatar
            className="hover:cursor-pointer h-[2.8em] w-[2.8em]"
            onClick={handleCompanyClick}
          >
            <AvatarImage
              src={opportunity.company?.profileImg}
              alt="company logo"
            />
            <AvatarFallback className="bg-third/10 text-third font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle
              className="text-base font-medium hover:cursor-pointer"
              onClick={handleCompanyClick}
            >
              {opportunity.company?.username}
            </CardTitle>

            <CardDescription className="text-xs">há {timeAgo}</CardDescription>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div onClick={handleDropdownClick}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <EllipsisVertical className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isOwner ? (
                    <>
                      <DropdownMenuItem
                        onClick={handleEditOpportunityOpen}
                        className="hover:cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>

                      <AlertDialog
                        open={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="hover:cursor-pointer"
                            onSelect={(e) => {
                              e.preventDefault();
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A oportunidade
                              será permanentemente removida da plataforma.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="hover:cursor-pointer">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-red-600 hover:bg-red-700 text-zinc-100 hover:cursor-pointer"
                              disabled={deleteOpportunity.isPending}
                            >
                              {deleteOpportunity.isPending
                                ? "Deletando..."
                                : "Excluir"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="hover:cursor-pointer">
                        <Share className="mr-2 h-4 w-4" />
                        Compartilhar
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        className="hover:cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Share className="mr-2 h-4 w-4" />
                        Compartilhar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 hover:cursor-pointer">
                        <Flag className="mr-2 h-4 w-4" />
                        Denunciar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="w-full mt-[-18px]">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">
              {opportunity.title}
            </h3>

            <p className="text-xs text-foreground line-clamp-3">
              {opportunity.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{opportunity.location}</span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Até {deadlineDate}</span>
              </div>

              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{opportunity.subscribers?.length || 0} candidatos</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col mt-[-15px]">
          <div className="flex w-full justify-between items-center">
            <CardAction className="flex items-center gap-3">
              {!isOwner && (
                <Button
                  size="sm"
                  variant="default"
                  className="bg-third hover:bg-third/90 text-white rounded-full px-4"
                  onClick={handleApply}
                >
                  Candidatar-se
                </Button>
              )}
            </CardAction>

            <CardAction className="flex items-center gap-2">
              <div onClick={handleBookmark} className="hover:cursor-pointer">
                <Bookmark
                  className={`h-5 w-5 transition-colors ${
                    isBookmarked
                      ? "text-third fill-third"
                      : "text-muted-foreground hover:text-third"
                  }`}
                />
              </div>
            </CardAction>
          </div>
        </CardFooter>
      </Card>

      <OpportunityDescription
        isOpen={isDescriptionOpen}
        onOpenChange={setIsDescriptionOpen}
        opportunity={opportunity}
      />

      <EditOpportunity
        open={isEditOpportunityOpen}
        onOpenChange={setIsEditOpportunityOpen}
        opportunity={opportunity}
      />
    </>
  );
}
