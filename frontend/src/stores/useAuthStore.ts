import {
  loginRequest,
  resetPasswordRequest,
  sendResetPasswordRequest,
  signUpRequest,
  signUpCompanyRequest,
  verifyEmailRequest,
  verifyResetTokenRequest,
} from "@/api/services/authService";
import type {
  AuthState,
  Login,
  ResetPassword,
  SendResetPassword,
  SignUp,
  SignUpCompany,
  VerifyCode,
} from "@/@types/auth.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/@types/user.types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      jwt: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      message: null,

      clearMessages: async () => set({ message: null, error: null }),
      setUser: (user: User) => set({ user }),

      logout: () => {
        set({
          user: null,
          jwt: null,
          isAuthenticated: false,
          message: "Logout realizado com sucesso",
        });
      },

      signup: async (request: SignUp | SignUpCompany) => {
        set({ loading: true, error: null, message: null });

        const isCompany = "cnpj" in request;
        const result = isCompany
          ? await signUpCompanyRequest(request as SignUpCompany)
          : await signUpRequest(request as SignUp);

        if (result.success) {
          set({
            loading: false,
            message: result.message,
          });
        } else {
          set({
            loading: false,
            error: result.error,
          });
        }
        return result;
      },

      verifyEmail: async (request: VerifyCode, email: string) => {
        set({
          loading: true,
          error: null,
          message: null,
          jwt: null,
          isAuthenticated: false,
          user: null,
        });

        const result = await verifyEmailRequest(request, email);

        if (result.success) {
          set({
            loading: false,
            message: result.message,
            jwt: result.data.data.jwt,
            isAuthenticated: true,
            user: result.data.data.user,
          });
        } else {
          set({
            loading: false,
            error: result.error,
          });
        }
      },

      sendResetPassword: async (request: SendResetPassword) => {
        set({ loading: true, error: null, message: null });

        const result = await sendResetPasswordRequest(request);

        set({
          loading: false,
          message: result.message,
          error: result.error,
        });

        return result;
      },

      verifyResetToken: async (request: VerifyCode, email: string) => {
        set({ loading: true, error: null, message: null });

        const result = await verifyResetTokenRequest(request, email);

        set({
          loading: false,
          error: result.error,
          message: result.message,
        });

        return result;
      },

      resetPassword: async (
        request: ResetPassword,
        verificationToken: string,
      ) => {
        set({
          loading: true,
          error: null,
          message: null,
        });

        const result = await resetPasswordRequest(request, verificationToken);

        set({
          loading: false,
          message: result.message,
          error: result.error,
        });
      },

      login: async (request: Login) => {
        set({ loading: true, error: null, message: null });

        const result = await loginRequest(request);

        if (result.success) {
          set({
            user: result.data.data.user,
            jwt: result.data.data.jwt,
            isAuthenticated: true,
            loading: false,
            message: result.data.data.message,
          });
        } else {
          set({
            loading: false,
            error: result.error,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        jwt: state.jwt,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
