export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface AdminAuthState {
  adminUser: AdminUser | null;
  jwt: string | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

export interface AdminLogin {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  user: AdminUser;
  token: string;
  permissions: Permission[];
}
