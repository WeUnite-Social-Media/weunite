import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema } from "@/schemas/auth/login.schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthMessages } from "@/hooks/useAuthMessages";
import { Separator } from "@/components/ui/separator";

export function Login({
  setCurrentTab,
}: {
  setCurrentTab: (tab: string) => void;
}) {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    await login(values);
  }

  useAuthMessages();

  return (
    <div className="">
      <div className="flex flex-col items-center">
        <DotLottieReact
          src="https://lottie.host/5ce60653-911c-4bcc-b385-b8be5f43b51e/OGOTw3OGfF.lottie"
          loop
          autoplay
          className="w-50 m-0"
        />
      </div>

      <Card className="w-[24em] lg:w-[30em] xl:w-[32em]">
        <div className="flex flex-col item-center text-center">
          <FormItem>
            <h1 className="text-2xl font-bold">Bem-Vindo a WeUnite</h1>
          </FormItem>
        </div>

        <div className="item-center text-center">
          <Button variant="outline" className="w-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            <span className="font-normal text">Continue com Google</span>
          </Button>
        </div>

        <div className="flex justify-around items-center text-sm">
          <Separator className="bg-separator-post data-[orientation=horizontal]:w-30 ml-10" />

          <span className="text-muted-foreground">ou</span>

          <Separator className="bg-separator-post data-[orientation=horizontal]:w-30 mr-10" />
        </div>

        <Form {...form}>
          <form
            className="-mt-7 p-6 md:p-8"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <div className="grid gap-2">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="username"
                          type="username"
                          placeholder="WeUnite"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-chart-5" />
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <FormLabel>Senha</FormLabel>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                        onClick={() => navigate("/auth/send-reset-password")}
                      >
                        Esqueceu sua senha?
                      </a>
                    </div>

                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="**********"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 transition-transform duration-300 ease-in-out"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground animate-pulse" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground animate-pulse" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-chart-5" />
                  </div>
                )}
              />
              <Button
                type="submit"
                className="w-full "
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>

              <div className="text-center text-sm">
                Não tem uma conta? <br />
                <span className="text-muted-foreground">
                  Cadastre-se como{" "}
                  <a
                    href="#"
                    className="underline decoration-solid"
                    onClick={() => setCurrentTab("signupcompany")}
                  >
                    clube
                  </a>{" "}
                  ou{" "}
                  <a
                    href="#"
                    className="underline decoration-solid"
                    onClick={() => setCurrentTab("signup")}
                  >
                    atleta
                  </a>
                </span>
              </div>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
