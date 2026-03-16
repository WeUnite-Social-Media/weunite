"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
var zod_1 = require("zod");
var user_schema_1 = require("@/shared/schemas/common/user.schema");
exports.loginSchema = zod_1.z.object({
    username: user_schema_1.usernameSchema,
    password: zod_1.z.string().min(1, {
        message: "A senha é obrigatória",
    }),
});
