export interface MarketJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  createdDate: string;
  category?: string;
  contractType?: string;
  sourceUrl?: string;
  skillsMentioned: string[];
}

export interface SkillFrequencyItem {
  skill: string;
  count: number;
  frequency: number; // 0 to 1
  category?: string;
}

export interface MarketSnapshot {
  id: string;
  role: string;
  location: string;
  country: string;
  query: string;
  totalJobs: number;
  sampleSize: number;
  skillCounts: Record<string, number>;
  skillFrequencies: SkillFrequencyItem[];
  demandIndex: number; // 0 - 100
  averageSalary?: number;
  source: string;
  sourceUrl?: string;
  fetchedAt: string;
  expiresAt: string;
  dataQuality: 'High' | 'Medium' | 'Low' | 'Limited Sample';
  provider: 'adzuna' | 'cached' | 'demo' | 'none';
  cacheStatus: 'live' | 'cached' | 'demo';
  warningMessage?: string;
}

export interface MarketProviderStatus {
  provider: string;
  configured: boolean;
  supportedCountries: string[];
  activeCountry: string;
  hasAppId: boolean;
  hasAppKey: boolean;
  rateLimitStatus?: string;
  lastTestedAt?: string;
  liveStatus: 'operational' | 'not_configured' | 'rate_limited' | 'error';
  errorMessage?: string;
}
