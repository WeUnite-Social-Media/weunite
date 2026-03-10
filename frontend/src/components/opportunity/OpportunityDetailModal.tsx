import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Opportunity } from "@/@types/opportunity.types";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Briefcase, Tag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OpportunityDetailModalProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile?: boolean;
}

export default function OpportunityDetailModal({
  opportunity,
  isOpen,
  onOpenChange,
  isMobile = false,
}: OpportunityDetailModalProps) {
  const navigate = useNavigate();

  const handleGoToOpportunity = () => {
    onOpenChange(false);
    navigate(`/opportunity`);
  };

  const OpportunityContent = () => (
    <div className="space-y-6">
      {/* Título e Empresa */}
      <div>
        <h3 className="text-2xl font-bold mb-2">{opportunity.title}</h3>
        {opportunity.company && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm">{opportunity.company.name}</span>
          </div>
        )}
      </div>

      {/* Informações principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {opportunity.location && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Localização</p>
              <p className="text-sm font-medium">{opportunity.location}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Data Limite</p>
            <p className="text-sm font-medium">
              {format(new Date(opportunity.dateEnd), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <span>Descrição</span>
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {opportunity.description}
        </p>
      </div>

      {/* Habilidades */}
      {opportunity.skills && opportunity.skills.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <span>Habilidades Requeridas</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {opportunity.skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botão de ação */}
      <div className="pt-4">
        <Button onClick={handleGoToOpportunity} className="w-full" size="lg">
          Ir para Oportunidade
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader className="text-left mb-6">
            <SheetTitle>Detalhes da Oportunidade</SheetTitle>
            <SheetDescription>
              Veja todas as informações sobre esta oportunidade
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            <OpportunityContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Oportunidade</DialogTitle>
          <DialogDescription>
            Veja todas as informações sobre esta oportunidade
          </DialogDescription>
        </DialogHeader>
        <OpportunityContent />
      </DialogContent>
    </Dialog>
  );
}
