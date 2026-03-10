import type { User } from "./user.types";

export interface AuthState {
  user: User | null;
  jwt: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  message: string | null;
  clearMessages: () => Promise<void>;
  setUser: (user: User) => void;
  signup: (data: SignUp | SignUpCompany) => Promise<Result>;
  verifyEmail: (data: VerifyCode, email: string) => Promise<void>;
  sendResetPassword: (data: SendResetPassword) => Promise<Result>;
  verifyResetToken: (data: VerifyCode, email: string) => Promise<Result>;
  resetPassword: (
    data: ResetPassword,
    verificationToken: string,
  ) => Promise<void>;
  login: (data: Login) => Promise<void>;
  logout: () => void;
}

export interface SignUp {
  name: string;
  username: string;
  email: string;
  password: string;
  role: "athlete";
}

export interface VerifyCode {
  verificationToken: string;
}

export interface SignUpCompany {
  name: string;
  username: string;
  email: string;
  cnpj: string;
  role: "company";
}

export interface SendResetPassword {
  email: string;
}

export interface ResetPassword {
  newPassword: string;
}

export interface Login {
  username: string;
  password: string;
}

export interface Result {
  success: boolean;
  message?: string | null;
  error?: string | null;
}
