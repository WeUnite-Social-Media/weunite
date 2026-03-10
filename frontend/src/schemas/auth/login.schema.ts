import { z } from "zod";
import { usernameSchema } from "../common/user.schema";

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, {
    message: "A senha é obrigatória",
  }),
});
