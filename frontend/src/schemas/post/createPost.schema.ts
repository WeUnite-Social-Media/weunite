import { z } from "zod";

export const createPostSchema = z.object({
  text: z
    .string()
    .min(1, { message: "O texto é obrigatório" })
    .max(500, { message: "O texto deve ter no máximo 500 caracteres" }),
  media: z
    .instanceof(File)
    .nullable()
    .refine(
      (file) => {
        if (!file) return true;

        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (isImage) return file.size <= 5 * 1024 * 1024;
        if (isVideo) return file.size <= 50 * 1024 * 1024;

        return false;
      },
      { message: "Imagens: máx 5MB, Vídeos: máx 50MB" }
    )
    .refine(
      (file) => {
        if (!file) return true;
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ];
        return allowedTypes.includes(file.type);
      },
      { message: "Formato inválido. Use imagens ou vídeos suportados" }
    ),
});
