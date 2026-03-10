import { z } from "zod";

export const updateOpportunitySchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter pelo menos 3 caracteres.")
    .max(120, "Título muito longo.")
    .optional(),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres.")
    .max(500, "Descrição muito longa.")
    .optional(),
  location: z.string().min(1, "Localização é obrigatória.").optional(),
  dateEnd: z
    .date({ required_error: "Data de término é obrigatória." })
    .optional(),
  skills: z
    .array(z.string().min(1, "Habilidade não pode ser vazia"))
    .min(1, "Selecione pelo menos uma habilidade")
    .optional(),
});

export type UpdateOpportunityFormData = z.infer<typeof updateOpportunitySchema>;
