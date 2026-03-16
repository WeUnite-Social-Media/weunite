"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostSchema = void 0;
var zod_1 = require("zod");
exports.createPostSchema = zod_1.z.object({
    text: zod_1.z
        .string()
        .min(1, { message: "O texto é obrigatório" })
        .max(500, { message: "O texto deve ter no máximo 500 caracteres" }),
    media: zod_1.z
        .instanceof(File)
        .nullable()
        .refine(function (file) {
        if (!file)
            return true;
        var isImage = file.type.startsWith("image/");
        var isVideo = file.type.startsWith("video/");
        if (isImage)
            return file.size <= 5 * 1024 * 1024;
        if (isVideo)
            return file.size <= 50 * 1024 * 1024;
        return false;
    }, { message: "Imagens: máx 5MB, Vídeos: máx 50MB" })
        .refine(function (file) {
        if (!file)
            return true;
        var allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "video/mp4",
            "video/webm",
            "video/quicktime",
        ];
        return allowedTypes.includes(file.type);
    }, { message: "Formato inválido. Use imagens ou vídeos suportados" }),
});
