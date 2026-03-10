import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useUpdateProfile } from "@/state/useUsers";
import {
  updateProfileSchema,
  type UpdateProfileForm,
} from "@/schemas/updateProfile.schema";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface EditProfileProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function EditProfile({
  isOpen,
  onOpenChange,
}: EditProfileProps) {
  const { user } = useAuthStore();
  const [preview, setPreview] = useState<string | null>(null);

  const editProfile = useUpdateProfile();

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name,
      username: user?.username,
      media: null,
    },
  });

  const handleFile = (file?: File | null) => {
    if (!file) {
      form.setValue("media", null);
      return;
    }
    form.setValue("media", file);
    const url = URL.createObjectURL(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });
  };

  async function onSubmit(values: UpdateProfileForm) {
    if (!user?.id) return;

    const result = await editProfile.mutateAsync({
      data: {
        name: values.name.trim(),
        username: values.username.trim(),
        profileImg: values?.media || undefined,
      },
      username: user.username,
    });

    if (result.success) {
      form.reset({ ...values, media: null });

      onOpenChange?.(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[30em] md:max-w-[40em]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias no seu perfil.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-3 justify-center">
                <FormField
                  control={form.control}
                  name="media"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div>
                          <Input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              handleFile(file);
                              field.onChange(file);
                            }}
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="relative group cursor-pointer"
                          >
                            <Avatar className="w-28 h-28 rounded-full">
                              <AvatarImage
                                src={
                                  preview ||
                                  user?.profileImg ||
                                  "/placeholder.png"
                                }
                                alt="Foto de perfil"
                                className="object-cover"
                              />
                              <AvatarFallback className="text-xl">
                                {user?.name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition-opacity">
                              Alterar
                            </div>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel htmlFor="name">Nome</FormLabel>
                    <FormControl>
                      <Input id="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel htmlFor="username">Username</FormLabel>
                    <FormControl>
                      <Input id="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex flex-row-reverse gap-2 mt-4">
              <Button type="submit" disabled={editProfile.isPending}>
                {editProfile.isPending ? "Salvando..." : "Salvar"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
