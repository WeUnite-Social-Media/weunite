import { z } from "zod";

export const createOpportunitySchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter pelo menos 3 caracteres.")
    .max(120, "Título muito longo."),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres.")
    .max(500, "Descrição muito longa."),
  location: z.string().min(1, "Localização é obrigatória."),
  dateEnd: z.date({ required_error: "Data de término é obrigatória." }),
  skills: z
    .array(z.string().min(1, "Habilidade não pode ser vazia"))
    .min(1, "Selecione pelo menos uma habilidade"),
});

export type CreateOpportunityFormData = z.infer<typeof createOpportunitySchema>;
