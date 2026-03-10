import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuthMessages } from "@/hooks/useAuthMessages";
import { useResendTimer } from "@/hooks/useResendTimer";
import { verifyResetTokenSchema } from "@/schemas/auth/recovery.schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

export function VerifyResetToken() {
  const form = useForm<z.infer<typeof verifyResetTokenSchema>>({
    resolver: zodResolver(verifyResetTokenSchema),
    defaultValues: {
      verificationToken: "",
    },
  });
  const { timer, canResend, startTimer } = useResendTimer();
  const { verifyResetToken } = useAuthStore();
  const { email } = useParams();
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof verifyResetTokenSchema>) {
    if (email) {
      const result = await verifyResetToken(values, email);
      if (result.success) {
        navigate(`/auth/reset-password/${values.verificationToken}`);
      }
    } else {
      toast.error("URL não existe");
      navigate("/auth");
    }
  }

  const handleResendCode = () => {
    startTimer();
  };

  useAuthMessages();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-[380px] max-w-full">
        <CardHeader className="space-y-2">
          <button
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            onClick={() => navigate("/auth/send-reset-password")}
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex flex-col text-center space-y-2">
            <CardTitle className="text-2xl font-bold">
              Redefinição de senha
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Um código de seis digitos foi enviado ao seu e-mail
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="verificationToken"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col items-center">
                    <FormControl>
                      <InputOTP maxLength={6} {...field} className="w-full">
                        <InputOTPGroup className="justify-center">
                          <InputOTPSlot
                            index={0}
                            className="transition-all duration-300 h-12 w-12"
                          />
                          <InputOTPSlot
                            index={1}
                            className="transition-all duration-300 h-12 w-12"
                          />
                          <InputOTPSlot
                            index={2}
                            className="transition-all duration-300 h-12 w-12"
                          />
                          <InputOTPSlot
                            index={3}
                            className="transition-all duration-300 h-12 w-12"
                          />
                          <InputOTPSlot
                            index={4}
                            className="transition-all duration-300 h-12 w-12"
                          />
                          <InputOTPSlot
                            index={5}
                            className="transition-all duration-300 h-12 w-12"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription className="text-center text-sm mt-2">
                      Digite o código enviado ao seu e-mail
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={
                  form.formState.isSubmitting || !form.formState.isValid
                }
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Verificar código"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <div className="text-sm text-center">
            <p>Não recebeu o código?</p>
            <Button
              variant="link"
              className="p-0 h-auto text-muted-foreground cursor-pointer"
              disabled={!canResend}
              onClick={handleResendCode}
            >
              {canResend ? "Reenviar código" : `Reenviar em ${timer}s`}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
