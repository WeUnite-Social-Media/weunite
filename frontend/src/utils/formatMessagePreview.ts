export const formatMessagePreview = (content: string): string => {
  if (!content) return "Sem mensagens";

  const isFileUrl =
    content.startsWith("/uploads/") || content.startsWith("http");

  if (isFileUrl) {
    const isImage = content.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isImage) {
      return "📷 Foto";
    }

    return "Arquivo";
  }

  return content;
};
