import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Opportunity } from "@/@types/opportunity.types";
import { X as CloseIcon, MapPin, Calendar, Users } from "lucide-react";
import { useBreakpoints } from "@/hooks/useBreakpoints";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getInitials } from "@/utils/getInitials";
import { getTimeAgo } from "@/hooks/useGetTimeAgo";

interface OpportunityDescriptionProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  opportunity: Opportunity;
}

export function OpportunityDescription({
  isOpen,
  onOpenChange,
  opportunity,
}: OpportunityDescriptionProps) {
  // const { user } = useAuthStore();

  const companyInitials = getInitials(opportunity.company?.name || "");

  const { commentDesktop } = useBreakpoints();

  const opportunityDate = new Date(opportunity.dateEnd).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );

  const handleApply = () => {};

  if (!commentDesktop) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[100vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh] mt-0 flex flex-col">
          <DrawerHeader className="pt-4 px-6 flex-shrink-0">
            <DrawerClose className="absolute rounded-sm transition-opacity right-4">
              <CloseIcon className="h-5 w-5 hover:cursor-pointer" />
            </DrawerClose>
            <DrawerTitle>Detalhes da Oportunidade</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col w-full items-center overflow-y-auto px-4 py-6">
            {/* Cabeçalho da oportunidade */}
            <div className="w-full max-w-[45em] mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={opportunity.company?.profileImg} />
                  <AvatarFallback>{companyInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{opportunity.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {opportunity.company?.name} • Publicado há{" "}
                    {getTimeAgo(opportunity.createdAt)}
                  </p>
                </div>
              </div>

              {/* Informações básicas */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {opportunity.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {opportunityDate}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {opportunity.subscribers?.length || 0} candidatos
                </div>
              </div>

              {/* Habilidades */}
              <div className="flex flex-wrap gap-2 mb-6">
                {opportunity.skills?.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>

              {/* Descrição */}
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="whitespace-pre-wrap">{opportunity.description}</p>
              </div>
            </div>

            {/* Botão de candidatura */}
            <div className="w-full max-w-[45em] border-t pt-4">
              <Button onClick={handleApply} className="w-full">
                Candidatar-se
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0 rounded-xl overflow-hidden">
        <div className="flex w-full h-full">
          <div className="w-full flex flex-col">
            {/* Cabeçalho */}
            <div className="p-6 border-b flex gap-3 bg-card">
              <Avatar className="h-12 w-12">
                <AvatarImage src={opportunity.company?.profileImg} />
                <AvatarFallback>{companyInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold">{opportunity.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {opportunity.company?.name} • Publicado há{" "}
                  {getTimeAgo(opportunity.createdAt)}
                </p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {/* Informações básicas */}
              <div className="flex flex-wrap gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{opportunity.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{opportunityDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{opportunity.subscribers?.length || 0} candidatos</span>
                </div>
              </div>

              {/* Habilidades */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Habilidades necessárias
                </h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills?.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer com botão de candidatura */}
            <div className="border-t p-6">
              <Button onClick={handleApply} className="w-full">
                Candidatar-se para esta oportunidade
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
