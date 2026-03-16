"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
var zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Nome muito curto").max(100),
    username: zod_1.z.string().min(3, "Mín 3 caracteres").max(30),
    media: zod_1.z.instanceof(File).optional().nullable(),
});
