export interface MobileEnv {
  apiUrl: string;
}

const DEFAULT_API_URL = "http://localhost:8080/api";

export function readMobileEnv(): MobileEnv {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;

  return { apiUrl };
}
