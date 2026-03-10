import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateComments } from "@/state/useComments";
import { createPostSchema } from "@/schemas/post/createPost.schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { Comment } from "@/@types/comment.types";

import { useEffect } from "react";

interface EditCommentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  comment?: Comment;
}

export function EditComment({ open, onOpenChange, comment }: EditCommentProps) {
  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      text: "",
      media: null,
    },
  });

  const { user } = useAuthStore();
  const updateCommentMutation = useUpdateComments();

  useEffect(() => {
    if (comment && open) {
      form.reset({
        text: comment.text || "",
        media: null,
      });
    }
  }, [comment, open, form]);

  async function onSubmit(values: z.infer<typeof createPostSchema>) {
    if (!user?.id) return;

    const result = await updateCommentMutation.mutateAsync({
      data: {
        text: values.text,
        media: values.media,
      },
      userId: Number(user.id),
      commentId: Number(comment?.id),
      postId: Number(comment?.post.id),
    });

    if (result.success) {
      form.reset();
      onOpenChange?.(false);
    }
  }

  const isSubmitting = updateCommentMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Editar comentário</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="comment-text">
                O que você gostaria de compartilhar?
              </Label>
              <Controller
                name="text"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    id="comment-text"
                    placeholder="Escreva sua mensagem aqui..."
                    className="min-h-[150px]"
                    {...field}
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
