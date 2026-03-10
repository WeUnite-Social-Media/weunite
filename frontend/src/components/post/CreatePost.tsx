import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "@/state/usePosts";
import { createPostSchema } from "@/schemas/post/createPost.schema";
import { useAuthStore } from "@/stores/useAuthStore";
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

  const { user } = useAuthStore();

  const createPostMutation = useCreatePost();

  async function onSubmit(values: z.infer<typeof createPostSchema>) {
    if (!user?.id) return;

    const result = await createPostMutation.mutateAsync({
      data: values,
      userId: Number(user.id),
    });

    if (result.success) {
      form.reset();
      onOpenChange?.(false);
    }
  }

  const isSubmitting = createPostMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <DialogClose asChild>
              <Button variant="outline" className="hover:cursor-pointer">
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
