export type TechRadarType = 'фреймворк' | 'библиотека' | 'язык программирования' | 'инструмент';
export type TechRadarSubtype = 'фронтенд' | 'бэкенд' | 'мобильная разработка' | 'инфраструктура' | 'аналитика' | 'DevOps' | 'SaaS' | 'библиотека';
export type TechRadarCategory = 'adopt' | 'trial' | 'assess' | 'hold' | 'drop';
export type MaturityLevel = 'experimental' | 'active' | 'stable' | 'deprecated' | 'end-of-life';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type SupportStatus = 'active' | 'limited' | 'end-of-life' | 'community-only';
export type CostFactor = 'free' | 'paid' | 'subscription' | 'enterprise';
export type ContributionFrequency = 'frequent' | 'regular' | 'occasional' | 'rare' | 'none';
export type PerformanceImpact = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'user';

export interface TechRadarEntity {
  id: string;
  name: string;
  version: string;
  versionReleaseDate?: string;
  type: TechRadarType;
  subtype?: TechRadarSubtype;
  category: TechRadarCategory;
  description?: string;
  firstAdded: string;
  lastUpdated?: string;
  owner: string;
  stakeholders?: string[];
  dependencies?: Array<{ name: string; version: string; optional?: boolean }>;
  maturity: MaturityLevel;
  riskLevel: RiskLevel;
  license: string;
  usageExamples?: string[];
  documentationUrl?: string;
  internalGuideUrl?: string;
  adoptionRate?: number;
  recommendedAlternatives?: string[];
  relatedTechnologies?: string[];
  endOfLifeDate?: string;
  supportStatus: SupportStatus;
  upgradePath?: string;
  performanceImpact?: PerformanceImpact;
  resourceRequirements?: {
    cpu: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
    memory: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
    storage: 'минимальные' | 'низкие' | 'средние' | 'высокие';
  };
  securityVulnerabilities?: string[];
  complianceStandards?: string[];
  communitySize?: number;
  contributionFrequency?: ContributionFrequency;
  popularityIndex?: number;
  compatibility?: {
    os?: string[];
    browsers?: string[];
    frameworks?: string[];
  };
  costFactor?: CostFactor;
  vendorLockIn: boolean;
  businessCriticality: RiskLevel;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface FilterState {
  category?: TechRadarCategory;
  type?: TechRadarType;
  subtype?: TechRadarSubtype;
  maturity?: MaturityLevel;
  search?: string;
}

export interface SortState {
  sortBy?: keyof TechRadarEntity;
  sortOrder: 'asc' | 'desc';
}

export interface RadarStatistics {
  total: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  bySubtype: Record<string, number>;
}
