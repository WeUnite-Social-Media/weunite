import { z } from "zod";

const optionalDecimal = z
  .string()
  .regex(/^\d+(\.\d+)?$/, "Numero invalido")
  .optional()
  .or(z.literal(""));

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(100),
  username: z.string().min(3, "Min 3 caracteres").max(30),
  bio: z.string().max(500).optional(),
  media: z.instanceof(File).optional().nullable(),
  skills: z.array(z.string().min(1)).max(5).optional(),
  height: optionalDecimal,
  weight: optionalDecimal,
  footDomain: z.string().max(30).optional(),
  position: z.string().max(60).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
