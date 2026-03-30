import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { useUpdateProfile } from "@/features/profile/state/useUsers";
import {
  updateProfileSchema,
  type UpdateProfileForm,
} from "@/features/profile/schemas/updateProfile.schema";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import CreateSkill from "@/features/opportunities/components/skill/CreateSkill";
import { SelectedSkills } from "@/features/opportunities/components/skill/SelectedSkills";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import { Separator } from "@/shared/components/ui/separator";

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
  const isAthlete = user?.role === "athlete";

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      media: null,
      skills: user?.skills?.map((skill) => skill.name) || [],
      height: user?.height ? String(user.height) : "",
      weight: user?.weight ? String(user.weight) : "",
      footDomain: user?.footDomain || undefined,
      position: user?.position || undefined,
      birthDate: user?.birthDate || "",
    },
  });

  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }

    form.reset({
      name: user.name,
      username: user.username,
      bio: user.bio || "",
      media: null,
      skills: user.skills?.map((skill) => skill.name) || [],
      height: user.height ? String(user.height) : "",
      weight: user.weight ? String(user.weight) : "",
      footDomain: user.footDomain || undefined,
      position: user.position || undefined,
      birthDate: user.birthDate || "",
    });

    setPreview(user.profileImg ?? null);
  }, [form, isOpen, user]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFile = (file?: File | null) => {
    if (!file) {
      form.setValue("media", null);
      return;
    }

    form.setValue("media", file);
    const url = URL.createObjectURL(file);

    setPreview((currentPreview) => {
      if (currentPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }
      return url;
    });
  };

  async function onSubmit(values: UpdateProfileForm) {
    if (!user?.id) {
      return;
    }

    const result = await editProfile.mutateAsync({
      data: {
        name: values.name.trim(),
        username: values.username.trim(),
        bio: values.bio?.trim() || undefined,
        profileImg: values.media || undefined,
        skills:
          values.skills?.map((skillName, index) => ({
            id: index + 1,
            name: skillName,
          })) || [],
        height: parseOptionalNumber(values.height),
        weight: parseOptionalNumber(values.weight),
        footDomain: values.footDomain?.trim() || undefined,
        position: values.position?.trim() || undefined,
        birthDate: values.birthDate || undefined,
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
      <DialogContent className="sm:max-w-[30em] md:max-w-[42em] max-h-[90vh] overflow-y-auto scrollbar-thumb">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informacoes basicas e, se for atleta, complete suas
            caracteristicas.
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
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
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

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel htmlFor="bio">Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        id="bio"
                        placeholder="Conte um pouco sobre voce"
                        className="resize-none"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isAthlete && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Informacoes do atleta
                    </span>
                    <Separator className="flex-1" />
                  </div>

                  <Controller
                    name="skills"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="grid gap-3">
                        <FormLabel>Habilidades</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <CreateSkill
                              selectedSkills={field.value || []}
                              onSkillsChange={field.onChange}
                            />
                            <SelectedSkills
                              skills={field.value || []}
                              showRemove
                              onRemoveSkill={(skillToRemove) => {
                                field.onChange(
                                  (field.value || []).filter(
                                    (skill) => skill !== skillToRemove,
                                  ),
                                );
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Altura (m)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="1.75"
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="70.5"
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="footDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pe dominante</FormLabel>
                          <Select
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Direito">Direito</SelectItem>
                              <SelectItem value="Esquerdo">Esquerdo</SelectItem>
                              <SelectItem value="Ambos">Ambos</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posicao</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Atacante"
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de nascimento</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            max={new Date().toISOString().slice(0, 10)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-row-reverse gap-2 mt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </DialogClose>

              <Button type="submit" disabled={editProfile.isPending}>
                {editProfile.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function parseOptionalNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
}
