import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuthMessages } from "@/hooks/useAuthMessages";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import { resetPasswordSchema } from "@/schemas/auth/recovery.schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { z } from "zod";

export function ResetPassword() {
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      newPasswordConfirmation: "",
    },
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirmation, setShowNewPasswordConfirmation] =
    useState(false);
  const { resetPassword } = useAuthStore();
  const { verificationToken } = useParams();
  const navigate = useNavigate();
  const password = form.watch("newPassword");
  const progress = usePasswordStrength(password);

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (verificationToken) {
      await resetPassword(
        { newPassword: values.newPassword },
        verificationToken
      );
      navigate("/auth");
    } else {
      toast.error("URL não existe", { position: "top-center" });
      navigate("/auth");
    }
  }

  useAuthMessages();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-[380px]">
        <CardHeader>
          <button
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            onClick={() => navigate("/auth")}
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex flex-col text-center space-y-2">
            <CardTitle className="text-2xl font-bold">
              Redefinição de senha
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Insira sua nova senha
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="**********"
                          className="pl-8"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-2.5 transition-transform duration-300 ease-in-out"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground animate-pulse" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground animate-pulse" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPasswordConfirmation"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Confirme sua nova senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={
                            showNewPasswordConfirmation ? "text" : "password"
                          }
                          placeholder="**********"
                          className="pl-8"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPasswordConfirmation(
                              !showNewPasswordConfirmation
                            )
                          }
                          className="absolute right-3 top-2.5 transition-transform duration-300 ease-in-out"
                        >
                          {showNewPasswordConfirmation ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground animate-pulse" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground animate-pulse" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div>
                <Progress value={progress} />
                <span className="text-xs">Segurança da senha</span>
              </div>

              <Button
                className="w-full"
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Redefinir"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
