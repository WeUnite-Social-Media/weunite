import { zodResolver } from "@hookform/resolvers/zod";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  AtSign,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  User,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuthMessages } from "@/features/auth/hooks/useAuthMessages";
import { signUpCompanySchema } from "@/features/auth/schemas/signUp.schema";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { TermsModal } from "@/features/legal/components/TermsModal";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";

const formatCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return numbers.replace(/(\d{2})(\d+)/, "$1.$2");
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
  }
  if (numbers.length <= 12) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
  }

  return numbers.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/,
    "$1.$2.$3/$4-$5",
  );
};

const extractCNPJNumbers = (formattedCNPJ: string) => {
  return formattedCNPJ.replace(/\D/g, "");
};

export function SignUpCompany({
  setCurrentTab,
}: {
  setCurrentTab: (tab: string) => void;
}) {
  const form = useForm<z.infer<typeof signUpCompanySchema>>({
    resolver: zodResolver(signUpCompanySchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      cnpj: "",
      password: "",
      role: "company",
    },
  });

  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  async function onSubmit(values: z.infer<typeof signUpCompanySchema>) {
    const result = await signup(values);
    if (result.success) {
      navigate(`/auth/verify-email/${values.email}`);
    }
  }

  useAuthMessages();

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-center">
        <DotLottieReact
          src="https://lottie.host/a06a613a-efd2-4dbd-96d0-2f4fd7344792/0jYYhWcj4H.lottie"
          loop
          autoplay
          className="m-0 w-50"
        />
      </div>

      <Card className="w-110 lg:120 xl:w-125">
        <CardContent>
          <div className="mb-3 text-center">
            <h2 className="text-2xl font-bold">Crie sua conta</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha os dados abaixo para começar
            </p>
          </div>

          <div className="space-y-4">
            <Form {...form}>
              <form
                className="space-y-3"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="João da Silva"
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserCircle className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="JoaoSilva"
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSign className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="joaosilva@provedor.com"
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="**********"
                            className="pl-8"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-2.5 right-3 transition-transform duration-300 ease-in-out"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 animate-pulse text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 animate-pulse text-muted-foreground" />
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
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="XX.XXX.XXX/0000-XX"
                            className="pl-8"
                            value={formatCNPJ(field.value)}
                            onChange={(e) => {
                              const formattedValue = formatCNPJ(e.target.value);
                              const numbersOnly =
                                extractCNPJNumbers(formattedValue);
                              field.onChange(numbersOnly);
                            }}
                            maxLength={18}
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            Digite apenas números. A formatação será aplicada
                            automaticamente.
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" required />
                    <div className="space-y-1">
                      <label
                        htmlFor="terms"
                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Aceito os termos para criar minha conta.
                      </label>
                      <button
                        type="button"
                        className="text-left text-xs font-medium underline underline-offset-4 hover:text-primary"
                        onClick={() => setIsTermsModalOpen(true)}
                      >
                        Ler termos e condições
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Cadastrar"
                    )}
                  </Button>

                  <span className="text-xs">
                    Já se cadastrou?{" "}
                    <a
                      href="#"
                      className="underline decoration-solid"
                      onClick={() => setCurrentTab("login")}
                    >
                      Login
                    </a>
                  </span>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>

      <TermsModal
        open={isTermsModalOpen}
        onOpenChange={setIsTermsModalOpen}
      />
    </div>
  );
}
