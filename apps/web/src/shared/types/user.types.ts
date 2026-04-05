export type UserRole = "athlete" | "company" | "admin" | "basic";

export interface UserSkill {
  id: number;
  name: string;
}

export interface User {
  id?: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  isAdmin?: boolean;
  cnpj?: string;
  bio?: string;
  isPrivate?: boolean;
  profileImg?: string;
  bannerImg?: string;
  createdAt?: string;
  updatedAt?: string;
  height?: number;
  weight?: number;
  footDomain?: string;
  position?: string;
  birthDate?: string;
  skills?: UserSkill[];
}

export interface GetUserByUsername {
  username: string;
}

export interface UpdateUser {
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  isPrivate?: boolean;
  profileImg?: File;
  bannerImg?: File;
  height?: number;
  weight?: number;
  footDomain?: string;
  position?: string;
  birthDate?: string;
  skills?: UserSkill[];
}
