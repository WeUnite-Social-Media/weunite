import { isDateOnOrAfterToday } from "@/features/opportunities/utils/opportunityDates";
import { z } from "zod";
import {
  OPPORTUNITY_DESCRIPTION_MAX_LENGTH,
  OPPORTUNITY_DESCRIPTION_MIN_LENGTH,
  OPPORTUNITY_TITLE_MAX_LENGTH,
  OPPORTUNITY_TITLE_MIN_LENGTH,
} from "./opportunityFieldConstraints";

export const updateOpportunitySchema = z.object({
  title: z
    .string()
    .min(
      OPPORTUNITY_TITLE_MIN_LENGTH,
      `Titulo deve ter pelo menos ${OPPORTUNITY_TITLE_MIN_LENGTH} caracteres.`,
    )
    .max(
      OPPORTUNITY_TITLE_MAX_LENGTH,
      `Titulo deve ter no maximo ${OPPORTUNITY_TITLE_MAX_LENGTH} caracteres.`,
    )
    .optional(),
  description: z
    .string()
    .min(
      OPPORTUNITY_DESCRIPTION_MIN_LENGTH,
      `Descricao deve ter pelo menos ${OPPORTUNITY_DESCRIPTION_MIN_LENGTH} caracteres.`,
    )
    .max(
      OPPORTUNITY_DESCRIPTION_MAX_LENGTH,
      `Descricao deve ter no maximo ${OPPORTUNITY_DESCRIPTION_MAX_LENGTH} caracteres.`,
    )
    .optional(),
  location: z.string().min(1, "Localizacao e obrigatoria.").optional(),
  dateEnd: z
    .date({ required_error: "Data de termino e obrigatoria." })
    .optional()
    .refine(
      (value) => value === undefined || isDateOnOrAfterToday(value),
      "Data de termino nao pode estar no passado.",
    ),
  skills: z
    .array(z.string().min(1, "Habilidade nao pode ser vazia"))
    .min(1, "Selecione pelo menos uma habilidade")
    .optional(),
});

export type UpdateOpportunityFormData = z.infer<typeof updateOpportunitySchema>;
