import type { User, UserRole, UserSkill } from "@/shared/types/user.types";

type UserLike = Partial<User> & {
  role?: string | null;
  skills?: Array<Partial<UserSkill>> | null;
};

const roleMap: Record<string, UserRole> = {
  athlete: "athlete",
  company: "company",
  admin: "admin",
  super_admin: "admin",
  basic: "basic",
};

export const normalizeRole = (role?: string | null): UserRole => {
  const normalizedRole = role?.trim().toLowerCase() ?? "basic";
  return roleMap[normalizedRole] ?? "basic";
};

export const normalizeUser = (user?: UserLike | null): User | null => {
  if (!user) {
    return null;
  }

  const skills = (user.skills ?? []).flatMap((skill, index) => {
    if (!skill?.name) {
      return [];
    }

    return [
      {
        id: Number(skill.id ?? index + 1),
        name: skill.name,
      },
    ];
  });

  return {
    ...user,
    id: user.id,
    name: user.name ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    role: normalizeRole(user.role),
    bio: user.bio ?? undefined,
    isPrivate: Boolean(user.isPrivate),
    profileImg: user.profileImg ?? undefined,
    bannerImg: user.bannerImg ?? undefined,
    createdAt: user.createdAt ?? undefined,
    updatedAt: user.updatedAt ?? undefined,
    height: user.height ?? undefined,
    weight: user.weight ?? undefined,
    footDomain: user.footDomain ?? undefined,
    position: user.position ?? undefined,
    birthDate: user.birthDate ?? undefined,
    skills,
  };
};
