import type {
  Login,
  ResetPassword,
  SendResetPassword,
  SignUp,
  SignUpCompany,
  VerifyCode,
} from "@/@types/auth.types";
import { instance as axios } from "../axios";
import { AxiosError } from "axios";

export const signUpRequest = async (data: SignUp) => {
  try {
    const response = await axios.post("/auth/signup", data);
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Cadastro concluído com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao se cadastrar",
    };
  }
};

export const verifyEmailRequest = async (data: VerifyCode, email: string) => {
  try {
    const response = await axios.post(`/auth/verify-email/${email}`, data);
    return {
      success: true,
      data: response.data,
      message: response.data.message,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao verificar e-mail",
    };
  }
};

export const signUpCompanyRequest = async (data: SignUpCompany) => {
  try {
    const response = await axios.post("/auth/signup/company", data);
    return {
      success: true,
      data: response.data,
      message:
        response.data.message || "Cadastro da empresa concluído com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao cadastrar empresa",
    };
  }
};

export const loginRequest = async (data: Login) => {
  try {
    const response = await axios.post("/auth/login", data);
    return {
      success: true,
      data: response.data,
      message: response.data.message,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao logar",
    };
  }
};

export const sendResetPasswordRequest = async (data: SendResetPassword) => {
  try {
    const response = await axios.post("/auth/send-reset-password", data);
    return {
      success: true,
      data: response.data,
      message: response.data.message,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao redefinir senha",
    };
  }
};

export const verifyResetTokenRequest = async (
  data: VerifyCode,
  email: string,
) => {
  try {
    const response = await axios.post(
      `/auth/verify-reset-token/${email}`,
      data,
    );
    return {
      success: true,
      data: response.data,
      message: response.data.message,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao verificar token",
    };
  }
};

export const resetPasswordRequest = async (
  data: ResetPassword,
  verificationToken: string,
) => {
  try {
    const response = await axios.post(
      `/auth/reset-password/${verificationToken}`,
      data,
    );
    return {
      success: true,
      data: response.data,
      message: response.data.message,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao redefinir senha",
    };
  }
};
