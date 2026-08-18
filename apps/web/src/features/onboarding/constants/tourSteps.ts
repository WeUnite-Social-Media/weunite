import {
  Bell,
  Briefcase,
  Home,
  MessageCircleMore,
  Trophy,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type OnboardingStep = {
  id: string;
  route: string;
  title: string;
  description: string;
  helperText: string;
  categoryTag?: string;
  icon: LucideIcon;
};

export const COMMON_STEPS: OnboardingStep[] = [
  {
    id: "home",
    route: "/home",
    title: "Sua Home & Feed",
    description:
      "Acompanhe o feed de conteúdos, atualizações de atletas, conquistas e novidades de patrocinadores.",
    helperText:
      "Interaja com a comunidade compartilhando seus treinos, conquistas e momentos.",
    categoryTag: "Feed Social",
    icon: Home,
  },
  {
    id: "chat",
    route: "/chat",
    title: "Mensagens & Conexões",
    description:
      "Converse em tempo real com marcas, clubes, olheiros e outros atletas para negociar apoios e parcerias.",
    helperText:
      "Utilize o chat direto para negociar propostas e manter contato próximo.",
    categoryTag: "Comunicação",
    icon: MessageCircleMore,
  },
  {
    id: "notifications",
    route: "/home",
    title: "Notificações & Alertas",
    description:
      "Fique por dentro de interações nos seus posts, novas candidaturas, respostas no chat e convites.",
    helperText:
      "Acompanhe as notificações no menu para não perder nenhuma oportunidade.",
    categoryTag: "Alertas",
    icon: Bell,
  },
];

export const ATHLETE_STEPS: OnboardingStep[] = [
  COMMON_STEPS[0],
  {
    id: "opportunities",
    route: "/opportunity",
    title: "Encontre Oportunidades",
    description:
      "Busque peneiras, bolsas de estudo, patrocínios e apoios criados por empresas e marcas esportivas.",
    helperText:
      "Filtre por modalidade esportiva e candidate-se às vagas com um clique.",
    categoryTag: "Atleta - Carreira",
    icon: Trophy,
  },
  COMMON_STEPS[1],
  COMMON_STEPS[2],
  {
    id: "profile",
    route: "/profile",
    title: "Seu Perfil de Atleta",
    description:
      "Mantenha seus dados físicos, modalidades, bio e links atualizados para se destacar para os patrocinadores.",
    helperText:
      "Perfis completos com foto, histórico e vídeos têm maior visibilidade.",
    categoryTag: "Atleta - Perfil",
    icon: User,
  },
];

export const COMPANY_STEPS: OnboardingStep[] = [
  COMMON_STEPS[0],
  {
    id: "opportunities",
    route: "/opportunity",
    title: "Publique Oportunidades",
    description:
      "Crie edital de apoio, seletivas ou patrocínios para encontrar novos talentos esportivos para sua marca.",
    helperText:
      "Gerencie inscritos e entre em contato direto com atletas promissores.",
    categoryTag: "Empresa - Talento",
    icon: Briefcase,
  },
  COMMON_STEPS[1],
  COMMON_STEPS[2],
  {
    id: "profile",
    route: "/profile",
    title: "Perfil Institucional",
    description:
      "Apresente sua marca, segmento de atuação e histórico de apoio ao esporte para atrair atletas alinhados.",
    helperText:
      "Um perfil corporativo bem estruturado transmite confiança e atrai grandes promessas.",
    categoryTag: "Empresa - Marca",
    icon: User,
  },
];

export function getOnboardingSteps(role?: string): OnboardingStep[] {
  const normalizedRole = role?.toUpperCase() || "";

  if (
    normalizedRole.includes("COMPANY") ||
    normalizedRole.includes("EMPRESA") ||
    normalizedRole.includes("SPONSOR")
  ) {
    return COMPANY_STEPS;
  }

  return ATHLETE_STEPS;
}

export const ONBOARDING_STEPS = ATHLETE_STEPS;
