import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  User,
  AtSign,
  UserCircle,
  Building2,
  KeyRound,
  Loader2,
  EyeOff,
  Eye,
} from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Checkbox } from "../ui/checkbox";
import { signUpCompanySchema } from "@/schemas/auth/signUp.schema";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthMessages } from "@/hooks/useAuthMessages";
import { useState } from "react";

const formatCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, "");

  // mask XX.XXX.XXX/XXXX-XX
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return numbers.replace(/(\d{2})(\d+)/, "$1.$2");
  if (numbers.length <= 8)
    return numbers.replace(/(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
  if (numbers.length <= 12)
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, "$1.$2.$3/$4-$5");
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

  async function onSubmit(values: z.infer<typeof signUpCompanySchema>) {
    const result = await signup(values);
    if (result.success) {
      navigate(`/auth/verify-email/${values.email}`);
    }
  }

  const [showPassword, setShowPassword] = useState(false);

  useAuthMessages();

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-center">
        <DotLottieReact
          src="https://lottie.host/a06a613a-efd2-4dbd-96d0-2f4fd7344792/0jYYhWcj4H.lottie"
          loop
          autoplay
          className="w-50 m-0"
        />
      </div>

      <Card className="w-110 lg:120 xl:w-125">
        <CardContent>
          <div className="text-center mb-3">
            <h2 className="text-2xl font-bold">Crie sua conta</h2>
            <p className="text-muted-foreground text-sm mt-1">
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                          <UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="JoãoSilva"
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
                          <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                          <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="**********"
                            className="pl-8"
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
                          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                          <p className="text-xs text-muted-foreground mt-1">
                            Digite apenas números, a formatação será aplicada
                            automaticamente.
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <label
                      htmlFor="terms"
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Aceitar{" "}
                      <a href="" className="underline decoration-solid">
                        termos e condições
                      </a>
                    </label>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Cadastrar"
                    )}
                  </Button>
                  <span className="text-xs">
                    Já se cadastrou? {""}
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
    </div>
  );
}
