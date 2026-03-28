import {
  Bell,
  Home,
  Link,
  MessageCircleMore,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type OnboardingStep = {
  id: string;
  route: string;
  title: string;
  description: string;
  helperText: string;
  icon: LucideIcon;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "home",
    route: "/home",
    title: "Sua home",
    description:
      "Aqui você acompanha o feed, descobre publicações recentes e vê a atividade da comunidade.",
    helperText: "Use a home como ponto de partida para tudo o que acontece no WeUnite.",
    icon: Home,
  },
  {
    id: "opportunities",
    route: "/opportunity",
    title: "Oportunidades",
    description:
      "Explore vagas esportivas, chamadas abertas e oportunidades criadas por empresas e equipes.",
    helperText: "Quando quiser descobrir novas chances, este é o melhor caminho.",
    icon: Link,
  },
  {
    id: "chat",
    route: "/chat",
    title: "Mensagens",
    description:
      "Converse em tempo real com outras pessoas da plataforma e acompanhe novas interações.",
    helperText: "O chat centraliza suas conversas e ajuda a transformar conexão em ação.",
    icon: MessageCircleMore,
  },
  {
    id: "notifications",
    route: "/home",
    title: "Notificações e atalhos",
    description:
      "A navegação principal também concentra notificações e atalhos para as ações mais importantes do dia a dia.",
    helperText: "Fique de olho nela para não perder curtidas, respostas e novidades.",
    icon: Bell,
  },
  {
    id: "profile",
    route: "/profile",
    title: "Seu perfil",
    description:
      "No perfil você edita seus dados, mostra sua trajetória e deixa sua presença na plataforma mais completa.",
    helperText: "Um perfil bem preenchido facilita conexões e aumenta sua visibilidade.",
    icon: User,
  },
];
