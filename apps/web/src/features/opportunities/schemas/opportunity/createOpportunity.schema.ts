import { z } from "zod";
import {
  OPPORTUNITY_DESCRIPTION_MAX_LENGTH,
  OPPORTUNITY_DESCRIPTION_MIN_LENGTH,
  OPPORTUNITY_TITLE_MAX_LENGTH,
  OPPORTUNITY_TITLE_MIN_LENGTH,
} from "./opportunityFieldConstraints";

export const createOpportunitySchema = z.object({
  title: z
    .string()
    .min(
      OPPORTUNITY_TITLE_MIN_LENGTH,
      `Título deve ter pelo menos ${OPPORTUNITY_TITLE_MIN_LENGTH} caracteres.`,
    )
    .max(
      OPPORTUNITY_TITLE_MAX_LENGTH,
      `Título deve ter no máximo ${OPPORTUNITY_TITLE_MAX_LENGTH} caracteres.`,
    ),
  description: z
    .string()
    .min(
      OPPORTUNITY_DESCRIPTION_MIN_LENGTH,
      `Descrição deve ter pelo menos ${OPPORTUNITY_DESCRIPTION_MIN_LENGTH} caracteres.`,
    )
    .max(
      OPPORTUNITY_DESCRIPTION_MAX_LENGTH,
      `Descrição deve ter no máximo ${OPPORTUNITY_DESCRIPTION_MAX_LENGTH} caracteres.`,
    ),
  location: z.string().min(1, "Localização é obrigatória."),
  dateEnd: z.date({ required_error: "Data de término é obrigatória." }),
  skills: z
    .array(z.string().min(1, "Habilidade não pode ser vazia"))
    .min(1, "Selecione pelo menos uma habilidade"),
});

export type CreateOpportunityFormData = z.infer<typeof createOpportunitySchema>;
