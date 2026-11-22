import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useCreatePost } from "@/features/feed/state/usePosts";
import { useTextHistory } from "@/features/feed/hook/useTextHistory";
import { createPostSchema } from "@/features/feed/schemas/post/createPost.schema";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface CreatePostProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreatePost({ open, onOpenChange }: CreatePostProps) {
  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      text: "",
      media: null,
    },
  });

  const { record, undo, clear, canUndo } = useTextHistory();
  const { user } = useAuthStore();

  const createPostMutation = useCreatePost();
  const isSubmitting = createPostMutation.isPending;

  function handleUndo(): void {
    const previousText = undo();

    if (previousText !== undefined) {
      form.setValue("text", previousText, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setFocus("text");
    }
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen && isSubmitting) {
      return;
    }

    if (!nextOpen) {
      form.reset();
      clear();
    }

    onOpenChange?.(nextOpen);
  }

  async function onSubmit(values: z.infer<typeof createPostSchema>) {
    if (!user?.id || isSubmitting) return;

    const result = await createPostMutation.mutateAsync({
      data: values,
      userId: Number(user.id),
    });

    if (result.success) {
      form.reset();
      clear();
      onOpenChange?.(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Criar nova publicação</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="post-text">
                O que você gostaria de compartilhar?
              </Label>
              <Controller
                name="text"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    id="post-text"
                    placeholder="Escreva sua mensagem aqui..."
                    className="min-h-[150px]"
                    {...field}
                    disabled={isSubmitting}
                    onChange={(event) => {
                      const nextText = event.target.value;

                      if (nextText !== field.value) {
                        record(field.value);
                        field.onChange(nextText);
                      }
                    }}
                  />
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="post-image">Adicionar imagem (opcional)</Label>
              <Controller
                name="media"
                control={form.control}
                render={({ field: { onChange, name } }) => (
                  <Input
                    id="post-image"
                    name={name}
                    type="file"
                    disabled={isSubmitting}
                    accept="image/*, video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                    }}
                    className="file:cursor-pointer hover:cursor-pointer"
                  />
                )}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleUndo}
              disabled={!canUndo || isSubmitting}
            >
              Desfazer
            </Button>

            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="hover:cursor-pointer"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="variant-third bg-third hover:bg-third-hover"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Publicando..." : "Publicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
