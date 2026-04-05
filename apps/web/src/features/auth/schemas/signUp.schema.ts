import { z } from "zod";
import { cnpjValidator } from "@/shared/validators/cnpjValidator";
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  usernameSchema,
} from "@/shared/schemas/common/user.schema";

export const signUpSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.literal("athlete"),
});

export const signUpCompanySchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  cnpj: z.string().refine((val) => cnpjValidator(val), {
    message: "CNPJ inválido",
  }),
  password: passwordSchema,
  role: z.literal("company"),
});
