import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(100),
  username: z.string().min(3, "Mín 3 caracteres").max(30),
  media: z.instanceof(File).optional().nullable(),
});

export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
