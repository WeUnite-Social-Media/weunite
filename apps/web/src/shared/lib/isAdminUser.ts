import type { User } from "@/shared/types/user.types";

export const isAdminUser = (user?: Pick<User, "role"> | null) =>
  user?.role === "admin";
