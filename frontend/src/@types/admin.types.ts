/**
 * Tipos relacionados ao painel administrativo
 */

/**
 * Estatísticas do dashboard administrativo
 */
export interface AdminStats {
  totalPosts: number;
  totalOpportunities: number;
  activeUsers: number;
  engagementRate: number;
  previousMonth: {
    totalPosts: number;
    totalOpportunities: number;
    activeUsers: number;
    engagementRate: number;
  };
}

/**
 * Ponto de dados para gráficos
 */
export interface ChartDataPoint {
  month: string;
  posts: number;
  opportunities: number;
}

/**
 * Dados de categoria para gráficos
 */
export interface CategoryData {
  category: string;
  count: number;
  fill: string;
}

/**
 * Dados de tipo de usuário para gráficos
 */
export interface UserTypeData {
  name: string;
  value: number;
  [key: string]: any;
}

/**
 * Cores do tema para gráficos
 */
export interface ChartColors {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  danger: string;
}

/**
 * Props para tooltips de gráficos
 */
export interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

/**
 * Resumo de denúncias por entidade
 */
export interface ReportSummary {
  entityId: number;
  entityType: string;
  reportCount: number;
}
