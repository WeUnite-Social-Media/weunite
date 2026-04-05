import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  OPPORTUNITY_DESCRIPTION_MAX_LENGTH,
  OPPORTUNITY_DESCRIPTION_MIN_LENGTH,
  OPPORTUNITY_TITLE_MAX_LENGTH,
} from "@/features/opportunities/schemas/opportunity/opportunityFieldConstraints";
import { updateOpportunitySchema } from "@/features/opportunities/schemas/opportunity/updateOpportunity.schema";
import { useUpdateOpportunity } from "@/features/opportunities/state/useOpportunities";
import { Calendar } from "@/shared/components/ui/calendar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import type { Opportunity } from "@/shared/types/opportunity.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, CalendarIcon, ChevronDownIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
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

  const descriptionValue = form.watch("description") ?? "";
  const descriptionLength = descriptionValue.length;

  useEffect(() => {
    if (!opportunity || !open) {
      return;
    }

    form.reset({
      title: opportunity.title || "",
      description: opportunity.description || "",
      location: opportunity.location || "",
      dateEnd: opportunity.dateEnd ? new Date(opportunity.dateEnd) : undefined,
      skills: opportunity.skills?.map((skill) => skill.name) || [],
    });
  }, [form, open, opportunity]);

  async function onSubmit(values: z.infer<typeof updateOpportunitySchema>) {
    if (!user?.id || !opportunity?.id) {
      return;
    }

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
        className="max-h-[90vh] w-[90vw] max-w-[40em] overflow-y-auto p-4"
        aria-describedby={undefined}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Editar oportunidade</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-3 text-sm"
        >
          <div className="grid gap-1">
            <Label htmlFor="opportunity-title" className="text-xs font-medium">
              Título <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Textarea
                    id="opportunity-title"
                    placeholder="Ex: Oportunidade para lateral esquerdo"
                    className={cn(
                      "min-h-[50px] resize-none text-sm",
                      fieldState.error &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    maxLength={OPPORTUNITY_TITLE_MAX_LENGTH}
                    aria-invalid={Boolean(fieldState.error)}
                    {...field}
                  />
                  {fieldState.error ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldState.error.message}</span>
                    </div>
                  ) : null}
                </>
              )}
            />
          </div>

          <div className="grid gap-1">
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor="opportunity-description"
                className="text-xs font-medium"
              >
                Descrição <span className="text-destructive">*</span>
              </Label>
              <span
                className={cn(
                  "text-xs",
                  descriptionLength < OPPORTUNITY_DESCRIPTION_MIN_LENGTH
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {descriptionLength}/{OPPORTUNITY_DESCRIPTION_MAX_LENGTH} caracteres
                {descriptionLength < OPPORTUNITY_DESCRIPTION_MIN_LENGTH
                  ? ` (mínimo ${OPPORTUNITY_DESCRIPTION_MIN_LENGTH})`
                  : ""}
              </span>
            </div>
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Textarea
                    id="opportunity-description"
                    placeholder="Descreva a oportunidade... (mínimo 10 caracteres)"
                    className={cn(
                      "min-h-[80px] resize-none text-sm",
                      fieldState.error &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    maxLength={OPPORTUNITY_DESCRIPTION_MAX_LENGTH}
                    aria-invalid={Boolean(fieldState.error)}
                    {...field}
                  />
                  {fieldState.error ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldState.error.message}</span>
                    </div>
                  ) : null}
                </>
              )}
            />
          </div>

          <div className="grid gap-1">
            <Label
              htmlFor="opportunity-location"
              className="text-xs font-medium"
            >
              Localização <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="location"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    id="opportunity-location"
                    placeholder="Ex: São Paulo, SP"
                    className={cn(
                      "h-8 text-sm",
                      fieldState.error &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    aria-invalid={Boolean(fieldState.error)}
                    {...field}
                  />
                  {fieldState.error ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldState.error.message}</span>
                    </div>
                  ) : null}
                </>
              )}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="opportunity-dateEnd" className="text-xs font-medium">
              Data limite <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="dateEnd"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <DropdownMenu
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-8 w-full justify-between text-left text-sm font-normal",
                          !field.value && "text-muted-foreground",
                          fieldState.error &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                      >
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecionar data</span>
                          )}
                        </div>
                        <ChevronDownIcon className="ml-2 h-3 w-3 opacity-50" />
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
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                        locale={ptBR}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {fieldState.error ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldState.error.message}</span>
                    </div>
                  ) : null}
                </>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="opportunity-skills" className="text-xs font-medium">
              Habilidades <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="skills"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <CreateSkill
                    selectedSkills={field.value || []}
                    onSkillsChange={field.onChange}
                  />
                  {(field.value?.length || 0) > 0 ? (
                    <SelectedSkills
                      skills={field.value || []}
                      showRemove={true}
                      onRemoveSkill={(skill) => {
                        const nextSkills = (field.value || []).filter(
                          (item) => item !== skill,
                        );
                        field.onChange(nextSkills);
                      }}
                      className="mt-2"
                    />
                  ) : null}
                  {fieldState.error ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldState.error.message}</span>
                    </div>
                  ) : null}
                </>
              )}
            />
          </div>

          <DialogFooter className="mt-4 flex-col-reverse gap-2 sm:flex-row">
            <DialogClose asChild>
              <Button variant="outline" className="h-8 text-sm">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="h-8 bg-third text-sm hover:bg-third-hover"
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
