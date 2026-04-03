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
      `Título deve ter pelo menos ${OPPORTUNITY_TITLE_MIN_LENGTH} caracteres.`,
    )
    .max(
      OPPORTUNITY_TITLE_MAX_LENGTH,
      `Título deve ter no máximo ${OPPORTUNITY_TITLE_MAX_LENGTH} caracteres.`,
    )
    .optional(),
  description: z
    .string()
    .min(
      OPPORTUNITY_DESCRIPTION_MIN_LENGTH,
      `Descrição deve ter pelo menos ${OPPORTUNITY_DESCRIPTION_MIN_LENGTH} caracteres.`,
    )
    .max(
      OPPORTUNITY_DESCRIPTION_MAX_LENGTH,
      `Descrição deve ter no máximo ${OPPORTUNITY_DESCRIPTION_MAX_LENGTH} caracteres.`,
    )
    .optional(),
  location: z.string().min(1, "Localização é obrigatória.").optional(),
  dateEnd: z.date({ required_error: "Data de término é obrigatória." }).optional(),
  skills: z
    .array(z.string().min(1, "Habilidade não pode ser vazia"))
    .min(1, "Selecione pelo menos uma habilidade")
    .optional(),
});

export type UpdateOpportunityFormData = z.infer<typeof updateOpportunitySchema>;
