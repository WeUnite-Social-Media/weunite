import type { User } from "./user.types";

export interface Skill {
  id: number;
  name: string;
}

export interface Subscriber {
  id: number;
  athlete?: User;
  athleteId?: number;
  opportunity?: Opportunity;
  opportunityId?: number;
}

export interface SavedOpportunity {
  id: number;
  athleteId: number;
  opportunity: Opportunity;
  savedAt: string;
}

export interface CreateOpportunity {
  title: string;
  description: string;
  location: string;
  dateEnd: Date;
  skills: Skill[];
}

export interface UpdateOpportunity {
  opportunityId: number;
  title?: string;
  description?: string;
  location?: string;
  dateEnd?: Date | string;
  skills?: Skill[];
}

export interface Opportunity {
  id: number;
  title: string;
  description: string;
  location: string;
  dateEnd: Date | string;
  skills?: Skill[];
  subscribers?: Subscriber[];
  subscribersCount?: number;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
  company?: User;
}
