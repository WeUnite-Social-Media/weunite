"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpCompanySchema = exports.signUpSchema = void 0;
var zod_1 = require("zod");
var cnpjValidator_1 = require("@/shared/validators/cnpjValidator");
var user_schema_1 = require("@/shared/schemas/common/user.schema");
exports.signUpSchema = zod_1.z.object({
    name: user_schema_1.nameSchema,
    username: user_schema_1.usernameSchema,
    email: user_schema_1.emailSchema,
    password: user_schema_1.passwordSchema,
    role: zod_1.z.literal("athlete"),
});
exports.signUpCompanySchema = zod_1.z.object({
    name: user_schema_1.nameSchema,
    username: user_schema_1.usernameSchema,
    email: user_schema_1.emailSchema,
    cnpj: zod_1.z.string().refine(function (val) { return (0, cnpjValidator_1.cnpjValidator)(val); }, {
        message: "CNPJ inválido",
    }),
    password: user_schema_1.passwordSchema,
    role: zod_1.z.literal("company"),
});
