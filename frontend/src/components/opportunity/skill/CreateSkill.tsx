import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Skill } from "@/@types/opportunity.types";

interface CreateSkillProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

// Mock de skills que virá do backend futuramente
const MOCK_SKILLS: Skill[] = [
  { id: 1, name: "Lateral Direito" },
  { id: 2, name: "Lateral Esquerdo" },
  { id: 3, name: "Zagueiro Central" },
  { id: 4, name: "Volante" },
  { id: 5, name: "Meio-campo" },
  { id: 6, name: "Meia Atacante" },
  { id: 7, name: "Ponta Direita" },
  { id: 8, name: "Ponta Esquerda" },
  { id: 9, name: "Centroavante" },
  { id: 10, name: "Segundo Atacante" },
  { id: 11, name: "Goleiro" },
  { id: 12, name: "Líbero" },
  { id: 13, name: "Ala Direito" },
  { id: 14, name: "Ala Esquerdo" },
  { id: 15, name: "Fixo" },
  { id: 16, name: "Pivô" },
  { id: 17, name: "Cabeceio" },
  { id: 18, name: "Finalização" },
  { id: 19, name: "Passe Longo" },
  { id: 20, name: "Dribles" },
  { id: 21, name: "Velocidade" },
  { id: 22, name: "Resistência" },
  { id: 23, name: "Agilidade" },
  { id: 24, name: "Força Física" },
  { id: 25, name: "Liderança em Campo" },
  { id: 26, name: "Marcação" },
  { id: 27, name: "Desarme" },
  { id: 28, name: "Cruzamentos" },
  { id: 29, name: "Cobrança de Falta" },
  { id: 30, name: "Cobrança de Pênalti" },
  { id: 31, name: "Jogo Aéreo" },
  { id: 32, name: "Visão de Jogo" },
  { id: 33, name: "Primeiro Toque" },
  { id: 34, name: "Ambidestro" },
  { id: 35, name: "Experiência Internacional" },
];

const SKILLS_PER_PAGE = 10;

export default function CreateSkill({
  selectedSkills,
  onSkillsChange,
}: CreateSkillProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSkills = MOCK_SKILLS.filter((skill) =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredSkills.length / SKILLS_PER_PAGE);
  const startIndex = (currentPage - 1) * SKILLS_PER_PAGE;
  const endIndex = startIndex + SKILLS_PER_PAGE;
  const currentSkills = filteredSkills.slice(startIndex, endIndex);

  const handleSkillToggle = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      onSkillsChange(selectedSkills.filter((s) => s !== skillName));
    } else if (selectedSkills.length < 5) {
      onSkillsChange([...selectedSkills, skillName]);
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    onSkillsChange(selectedSkills.filter((s) => s !== skillName));
  };

  const handleCancel = () => {
    setOpen(false);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const canSelectMore = selectedSkills.length < 5;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-sm font-normal border-none"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Habilidades
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar Habilidades</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecione até 5 habilidades para esta oportunidade
          </p>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar habilidades..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
            <X
              className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer",
                searchTerm ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
              onClick={() => setSearchTerm("")}
            />
          </div>

          {selectedSkills.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Selecionadas ({selectedSkills.length}/5):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="default"
                    className="flex items-center h-[2em] gap-1 cursor-pointer hover:bg-primary/90 transition-colors"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    {skill}
                    <X
                      className="h-3 w-3 hover:bg-primary/20 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSkill(skill);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto scrollbar-thumb">
            <div className="space-y-4">
              {currentSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill.name);
                const isDisabled = !isSelected && !canSelectMore;

                return (
                  <div
                    key={skill.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      isSelected
                        ? "bg-primary/5 border-primary/20"
                        : "hover:bg-accent",
                      isDisabled && "opacity-50 cursor-not-allowed",
                    )}
                    onClick={() => !isDisabled && handleSkillToggle(skill.name)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => handleSkillToggle(skill.name)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        isDisabled && "text-muted-foreground",
                      )}
                    >
                      {skill.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {filteredSkills.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma habilidade encontrada para "{searchTerm}"</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>

              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            className="bg-third hover:bg-third-hover"
            onClick={() => setOpen(false)}
          >
            Salvar ({selectedSkills.length}/5)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
