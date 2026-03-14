export interface DashboardStats {
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

export interface MonthlyActivity {
  month: string;
  posts: number;
  opportunities: number;
  users: number;
}

export interface OpportunityByCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface DashboardData {
  stats: DashboardStats;
  monthlyActivity: MonthlyActivity[];
  opportunitiesByCategory: OpportunityByCategory[];
}
