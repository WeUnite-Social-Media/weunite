import type { User } from "./user.types";

export interface Skill {
  id: number;
  name: string;
}

export interface Subscriber {
  id: number;
  athleteId: number;
  opportunityId: number;
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
  dateEnd?: Date;
  skills?: Skill[];
}

export interface Opportunity {
  id: number;
  title: string;
  description: string;
  location: string;
  dateEnd: Date;
  skills?: Skill[];
  subscribers?: Subscriber[];
  createdAt: Date;
  updatedAt?: Date;
  company?: User;
}
