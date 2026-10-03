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
        // 10MB, not the 50MB this used to allow: the API caps every multipart
        // request at 10MB (`spring.servlet.multipart.max-file-size` and
        // `.max-request-size`), so anything bigger passed this check and then
        // failed at the server.
        if (isVideo) return file.size <= 10 * 1024 * 1024;

        return false;
      },
      { message: "Imagens: máx 5MB, Vídeos: máx 10MB" },
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
      { message: "Formato inválido. Use imagens ou vídeos suportados" },
    ),
});
