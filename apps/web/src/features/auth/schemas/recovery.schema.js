"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.verifyResetTokenSchema = exports.sendResetPasswordSchema = void 0;
var zod_1 = require("zod");
var user_schema_1 = require("@/shared/schemas/common/user.schema");
exports.sendResetPasswordSchema = zod_1.z.object({
    email: user_schema_1.emailSchema,
});
exports.verifyResetTokenSchema = zod_1.z.object({
    verificationToken: zod_1.z
        .string()
        .min(6, { message: "O código deve ter 6 digitos" }),
});
exports.resetPasswordSchema = zod_1.z
    .object({
    newPassword: user_schema_1.passwordSchema,
    newPasswordConfirmation: user_schema_1.passwordSchema,
})
    .refine(function (data) { return data.newPassword === data.newPasswordConfirmation; }, {
    message: "As senhas devem ser iguais",
    path: ["newPasswordConfirmation"],
});
