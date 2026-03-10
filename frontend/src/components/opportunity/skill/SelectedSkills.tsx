import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectedSkillsProps {
  skills: string[];
  onRemoveSkill?: (skill: string) => void;
  className?: string;
  showRemove?: boolean;
}

export function SelectedSkills({
  skills,
  onRemoveSkill,
  className,
  showRemove = false,
}: SelectedSkillsProps) {
  if (skills.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground py-2", className)}>
        Nenhuma habilidade selecionada
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {skills.map((skill) => (
        <Badge
          key={skill}
          variant="secondary"
          className={cn(
            "flex items-center gap-1",
            onRemoveSkill &&
              "cursor-pointer h-[3em] hover:bg-secondary/80 transition-colors",
          )}
          onClick={() => onRemoveSkill && onRemoveSkill(skill)}
        >
          {skill}
          {showRemove && onRemoveSkill && (
            <X
              className="h-3 w-3 cursor-pointer hover:bg-secondary/60 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSkill(skill);
              }}
            />
          )}
        </Badge>
      ))}
    </div>
  );
}
