/**
 * Tipos relacionados ao sistema de denúncias/reports
 */

import type { User } from "./user.types";
import type { Post } from "./post.types";
import type { Opportunity } from "./opportunity.types";

/**
 * Status possíveis de uma denúncia
 */
export type ReportStatus =
  | "pending"
  | "under_review"
  | "resolved"
  | "dismissed";

/**
 * Motivos de denúncia disponíveis
 */
export type ReportReason =
  | "spam"
  | "harassment"
  | "inappropriate_content"
  | "fake_profile"
  | "fake_opportunity"
  | "copyright_violation"
  | "other";

/**
 * Tipo de entidade que pode ser denunciada
 */
export type ReportEntityType = "post" | "user" | "opportunity" | "comment";

/**
 * Interface base para uma denúncia
 */
export interface Report {
  id: string;
  entityId?: number;
  entityType?: "POST" | "USER" | "OPPORTUNITY" | "COMMENT";
  reportedBy: {
    name: string;
    username: string;
  };
  reportedUser: {
    name: string;
    username: string;
  };
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
  content: string;
  imageUrl?: string;
}

/**
 * Interface para denúncia individual de post
 */
export interface PostReport {
  id: string;
  postId: string;
  reporter: User;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

/**
 * Interface para post com suas denúncias
 */
export interface ReportedPost {
  post: Post;
  reports: PostReport[];
  totalReports: number;
  status: "pending" | "hidden" | "deleted";
}

/**
 * Interface para denúncia de usuário
 */
export interface UserReport {
  id: string;
  userId: string;
  reporter: User;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

/**
 * Interface para usuário denunciado
 */
export interface ReportedUser {
  user: User;
  reports: UserReport[];
  totalReports: number;
  status: "active" | "suspended" | "banned";
}

/**
 * Interface para denúncia de oportunidade
 */
export interface OpportunityReport {
  id: string;
  opportunityId: string;
  reporter: User;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

/**
 * Interface para oportunidade denunciada
 */
export interface ReportedOpportunity {
  opportunity: Opportunity;
  reports: OpportunityReport[];
  totalReports: number;
  status: "active" | "hidden" | "deleted";
}

/**
 * Ação de moderação disponível
 */
export interface ModerationAction {
  action: "hide" | "delete" | "dismiss" | "suspend" | "ban" | "warn";
  entityId: string;
  entityType: ReportEntityType;
  reason?: string;
  duration?: number;
}

/**
 * Resposta da API para ações de moderação
 */
export interface ModerationResponse {
  success: boolean;
  message: string;
  data?: any;
}
