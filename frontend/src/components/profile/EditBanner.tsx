import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Check, ImageUp, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUpdateProfile, useDeleteProfileBanner } from "@/state/useUsers";
import {
  updateProfileSchema,
  type UpdateProfileForm,
} from "@/schemas/updateProfile.schema";

interface EditBannerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditBanner({ isOpen, onOpenChange }: EditBannerProps) {
  const { user } = useAuthStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const updateProfileBanner = useUpdateProfile();
  const deleteProfileBanner = useDeleteProfileBanner();

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      media: null,
    },
  });

  const resizeImage = (
    file: File,
    targetWidth: number,
    targetHeight: number,
  ): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        const { width: originalWidth, height: originalHeight } = img;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const scaleX = targetWidth / originalWidth;
        const scaleY = targetHeight / originalHeight;
        const scale = Math.max(scaleX, scaleY);

        const scaledWidth = originalWidth * scale;
        const scaledHeight = originalHeight * scale;

        const x = (targetWidth - scaledWidth) / 2;
        const y = (targetHeight - scaledHeight) / 2;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob!], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          file.type,
          0.92,
        ); // Qualidade 92% para melhor resultado
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file?: File | null) => {
    if (!file) {
      form.setValue("media", null);
      setPreview(null);
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 10MB.");
      return;
    }

    try {
      const resizedFile = await resizeImage(file, 1584, 396);

      setSelectedFile(resizedFile);
      const url = URL.createObjectURL(resizedFile);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      alert("Erro ao processar a imagem. Tente novamente.");
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      await updateProfileBanner.mutateAsync({
        username: user?.username || "",
        data: {
          name: user?.name || "",
          username: user?.username || "",
          email: user?.email || "",
          bannerImg: selectedFile,
        },
      });

      handleCancel();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar banner:", error);
      alert("Erro ao salvar o banner. Tente novamente.");
    }
  };

  const handleDelete = async () => {
    if (!user?.username) return;

    try {
      await deleteProfileBanner.mutateAsync(user.username);
      handleCancel();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao excluir banner:", error);
      alert("Erro ao excluir o banner. Tente novamente.");
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    form.setValue("media", null);
  };

  const handleClose = () => {
    handleCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar foto de capa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-[4/1] w-full overflow-hidden rounded-lg border bg-gray-100 flex items-center justify-center">
            {preview || user?.bannerImg ? (
              <img
                src={preview || user?.bannerImg}
                alt="Preview do banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <ImageUp className="h-8 w-8" />
                <span className="text-sm">Nenhuma imagem selecionada</span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2">
            <Input
              id="banner-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                handleFileSelect(file);
              }}
            />
            <Button
              variant="outline"
              onClick={() =>
                document.getElementById("banner-file-input")?.click()
              }
              className="flex-1"
            >
              <ImageUp className="h-4 w-4 mr-2" />
              {selectedFile ? "Alterar imagem" : "Selecionar imagem"}
            </Button>

            {user?.bannerImg && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleteProfileBanner.isPending}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex justify-center md:justify-end gap-2">
            <Button
              onClick={handleClose}
              className="w-[10em] md:w-[8em]"
              disabled={updateProfileBanner.isPending}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="third"
              className="w-[10em] md:w-[8em]"
              disabled={updateProfileBanner.isPending || !selectedFile}
            >
              <Check className="h-4 w-4" />
              {updateProfileBanner.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
