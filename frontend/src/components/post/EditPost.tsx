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
import { useUpdatePost } from "@/state/usePosts";
import { createPostSchema } from "@/schemas/post/createPost.schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { Post } from "@/@types/post.types";
import { useEffect } from "react";

interface EditPostProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  post?: Post;
}

export function EditPost({ open, onOpenChange, post }: EditPostProps) {
  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      text: "",
      media: null,
    },
  });

  const { user } = useAuthStore();
  const updatePostMutation = useUpdatePost();

  useEffect(() => {
    if (post && open) {
      form.reset({
        text: post.text || "",
        media: null,
      });
    }
  }, [post, open, form]);

  async function onSubmit(values: z.infer<typeof createPostSchema>) {
    if (!user?.id) return;

    const result = await updatePostMutation.mutateAsync({
      data: {
        text: values.text,
        media: values.media,
      },
      userId: Number(user.id),
      postId: Number(post?.id),
    });

    if (result.success) {
      form.reset();
      onOpenChange?.(false);
    }
  }

  const isSubmitting = updatePostMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Editar publicação</DialogTitle>
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
              variant="third"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Editar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
