import { z } from "zod";
import { emailSchema, passwordSchema } from "../common/user.schema";

export const sendResetPasswordSchema = z.object({
  email: emailSchema,
});

export const verifyResetTokenSchema = z.object({
  verificationToken: z
    .string()
    .min(6, { message: "O código deve ter 6 digitos" }),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    newPasswordConfirmation: passwordSchema,
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "As senhas devem ser iguais",
    path: ["newPasswordConfirmation"],
  });
