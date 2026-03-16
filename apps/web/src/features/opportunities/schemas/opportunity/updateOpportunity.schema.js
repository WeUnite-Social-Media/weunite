"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOpportunitySchema = void 0;
var zod_1 = require("zod");
exports.updateOpportunitySchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3, "Título deve ter pelo menos 3 caracteres.")
        .max(120, "Título muito longo.")
        .optional(),
    description: zod_1.z
        .string()
        .min(10, "Descrição deve ter pelo menos 10 caracteres.")
        .max(500, "Descrição muito longa.")
        .optional(),
    location: zod_1.z.string().min(1, "Localização é obrigatória.").optional(),
    dateEnd: zod_1.z
        .date({ required_error: "Data de término é obrigatória." })
        .optional(),
    skills: zod_1.z
        .array(zod_1.z.string().min(1, "Habilidade não pode ser vazia"))
        .min(1, "Selecione pelo menos uma habilidade")
        .optional(),
});
