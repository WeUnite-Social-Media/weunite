import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateOpportunity } from "@/state/useOpportunities";
import { updateOpportunitySchema } from "@/schemas/opportunity/updateOpportunity.schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { Opportunity } from "@/@types/opportunity.types";
import { useEffect, useState } from "react";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import CreateSkill from "./skill/CreateSkill";
import { SelectedSkills } from "./skill/SelectedSkills";

interface EditOpportunityProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  opportunity?: Opportunity;
}

export function EditOpportunity({
  open,
  onOpenChange,
  opportunity,
}: EditOpportunityProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<z.infer<typeof updateOpportunitySchema>>({
    resolver: zodResolver(updateOpportunitySchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      dateEnd: undefined,
      skills: [],
    },
  });

  const { user } = useAuthStore();
  const updateOpportunityMutation = useUpdateOpportunity();

  useEffect(() => {
    if (opportunity && open) {
      form.reset({
        title: opportunity.title || "",
        description: opportunity.description || "",
        location: opportunity.location || "",
        dateEnd: opportunity.dateEnd
          ? new Date(opportunity.dateEnd)
          : undefined,
        skills: opportunity.skills?.map((skill) => skill.name) || [],
      });
    }
  }, [opportunity, open, form]);

  async function onSubmit(values: z.infer<typeof updateOpportunitySchema>) {
    if (!user?.id || !opportunity?.id) return;

    const result = await updateOpportunityMutation.mutateAsync({
      data: {
        opportunityId: Number(opportunity.id),
        title: values.title,
        description: values.description,
        location: values.location,
        dateEnd: values.dateEnd,
        skills: values.skills?.map((skillName, index) => ({
          id: index + 1,
          name: skillName,
        })),
      },
      companyId: Number(user.id),
    });

    if (result.success) {
      form.reset();
      onOpenChange?.(false);
    }
  }

  const isSubmitting = updateOpportunityMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[90vw] max-w-[40em] max-h-[90vh] overflow-y-auto p-4"
        aria-describedby={undefined}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Editar Oportunidade</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-2 text-sm"
        >
          <div className="grid gap-1">
            <Label htmlFor="opportunity-title" className="text-xs font-medium">
              Título
            </Label>
            <Controller
              name="title"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  id="opportunity-title"
                  placeholder="Ex: Oportunidade para lateral esquerdo"
                  className="min-h-[50px] resize-none text-sm"
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid gap-1">
            <Label
              htmlFor="opportunity-description"
              className="text-xs font-medium"
            >
              Descrição
            </Label>
            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  id="opportunity-description"
                  placeholder="Descreva a oportunidade..."
                  className="min-h-[60px] resize-none text-sm"
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid gap-1">
            <Label
              htmlFor="opportunity-location"
              className="text-xs font-medium"
            >
              Localização
            </Label>
            <Controller
              name="location"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="opportunity-location"
                  placeholder="Ex: São Paulo, SP"
                  className="h-8 text-sm"
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid gap-1">
            <Label
              htmlFor="opportunity-dateEnd"
              className="text-xs font-medium"
            >
              Data limite
            </Label>
            <Controller
              name="dateEnd"
              control={form.control}
              render={({ field }) => (
                <DropdownMenu
                  open={isCalendarOpen}
                  onOpenChange={setIsCalendarOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal h-8 text-sm",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </div>
                      <ChevronDownIcon className="ml-2 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setIsCalendarOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      locale={ptBR}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="opportunity-skills" className="text-xs font-medium">
              Habilidades
            </Label>
            <Controller
              name="skills"
              control={form.control}
              render={({ field }) => (
                <>
                  <CreateSkill
                    selectedSkills={field.value || []}
                    onSkillsChange={field.onChange}
                  />
                  {(field.value?.length || 0) > 0 && (
                    <SelectedSkills
                      skills={field.value || []}
                      showRemove={true}
                      onRemoveSkill={(skill) => {
                        const newSkills = (field.value || []).filter(
                          (s) => s !== skill,
                        );
                        field.onChange(newSkills);
                      }}
                      className="mt-2"
                    />
                  )}
                </>
              )}
            />
          </div>

          <DialogFooter className="mt-4 flex-col-reverse sm:flex-row gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="h-8 text-sm hover:cursor-pointer"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="h-8 text-sm variant-third bg-third hover:bg-third-hover"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
