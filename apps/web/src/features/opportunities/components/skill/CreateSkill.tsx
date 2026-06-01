import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { Loader2, Plus, Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Skill } from "@/shared/types/opportunity.types";
import { getAvailableSkillsRequest } from "@/features/opportunities/api/opportunityService";

interface CreateSkillProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

const SKILLS_PER_PAGE = 10;

export default function CreateSkill({
  selectedSkills,
  onSkillsChange,
}: CreateSkillProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;

    const loadSkills = async () => {
      setIsLoading(true);
      setLoadError(null);

      const response = await getAvailableSkillsRequest();

      if (!isMounted) {
        return;
      }

      if (response.success && response.data) {
        setAvailableSkills(response.data);
      } else {
        setLoadError(
          response.error || "Nao foi possivel carregar as habilidades.",
        );
      }

      setIsLoading(false);
    };

    void loadSkills();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const filteredSkills = useMemo(
    () =>
      availableSkills.filter((skill) =>
        skill.name.toLowerCase().includes(normalizedSearchTerm),
      ),
    [availableSkills, normalizedSearchTerm],
  );

  const totalPages = Math.ceil(filteredSkills.length / SKILLS_PER_PAGE);
  const startIndex = (currentPage - 1) * SKILLS_PER_PAGE;
  const endIndex = startIndex + SKILLS_PER_PAGE;
  const currentSkills = filteredSkills.slice(startIndex, endIndex);

  const hasSelectedSkill = (skillName: string) =>
    selectedSkills.some(
      (selectedSkill) =>
        selectedSkill.toLowerCase() === skillName.toLowerCase(),
    );

  const handleSkillToggle = (skillName: string) => {
    if (hasSelectedSkill(skillName)) {
      onSkillsChange(
        selectedSkills.filter(
          (selectedSkill) =>
            selectedSkill.toLowerCase() !== skillName.toLowerCase(),
        ),
      );
    } else if (selectedSkills.length < 5) {
      onSkillsChange([...selectedSkills, skillName]);
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    onSkillsChange(
      selectedSkills.filter(
        (selectedSkill) =>
          selectedSkill.toLowerCase() !== skillName.toLowerCase(),
      ),
    );
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
  const hasExactSkillMatch = availableSkills.some(
    (skill) => skill.name.toLowerCase() === normalizedSearchTerm,
  );
  const customSkillName = searchTerm.trim();
  const canAddCustomSkill =
    customSkillName.length > 0 &&
    !hasExactSkillMatch &&
    !hasSelectedSkill(customSkillName);

  const handleAddCustomSkill = () => {
    if (!canAddCustomSkill || !canSelectMore) {
      return;
    }

    handleSkillToggle(customSkillName);
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setSearchTerm("");
          setCurrentPage(1);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start border-none text-sm font-normal"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Habilidades
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[80vh] w-[95vw] max-w-[600px] flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar Habilidades</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecione ate 5 habilidades para esta oportunidade
          </p>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Buscar habilidades..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddCustomSkill();
                }
              }}
              className="pl-10"
            />
            <X
              className={cn(
                "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform cursor-pointer text-muted-foreground",
                searchTerm ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
            />
          </div>

          {selectedSkills.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Selecionadas ({selectedSkills.length}/5):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="default"
                    className="flex h-[2em] cursor-pointer items-center gap-1 transition-colors hover:bg-primary/90"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    {skill}
                    <X
                      className="h-3 w-3 rounded-full hover:bg-primary/20"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveSkill(skill);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex-1 overflow-auto scrollbar-thumb">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Carregando habilidades...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {loadError ? (
                  <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    {loadError}
                  </div>
                ) : null}

                {canAddCustomSkill ? (
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                      canSelectMore
                        ? "hover:bg-accent"
                        : "cursor-not-allowed opacity-50",
                    )}
                    onClick={handleAddCustomSkill}
                    disabled={!canSelectMore}
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">
                      Adicionar "{customSkillName}"
                    </span>
                  </button>
                ) : null}

                {currentSkills.map((skill) => {
                  const isSelected = hasSelectedSkill(skill.name);
                  const isDisabled = !isSelected && !canSelectMore;

                  return (
                    <div
                      key={skill.id}
                      className={cn(
                        "flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors",
                        isSelected
                          ? "border-primary/20 bg-primary/5"
                          : "hover:bg-accent",
                        isDisabled && "cursor-not-allowed opacity-50",
                      )}
                      onClick={() =>
                        !isDisabled && handleSkillToggle(skill.name)
                      }
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => handleSkillToggle(skill.name)}
                        onClick={(event) => event.stopPropagation()}
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

                {!loadError &&
                filteredSkills.length === 0 &&
                !canAddCustomSkill ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>Nenhuma habilidade encontrada para "{searchTerm}"</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 border-t pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>

              <span className="text-sm text-muted-foreground">
                Pagina {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Proxima
              </Button>
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
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
