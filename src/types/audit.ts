export interface SystemAuditMetrics {
  jobsAnalyzed: number;
  skillsExtracted: number;
  skillsNormalized: number;
  marketSnapshotsCount: number;
  cacheHitRate: number; // percentage
  apiCallCount: number;
  apiStatus: {
    gemini: 'operational' | 'error' | 'not_configured';
    adzuna: 'operational' | 'not_configured' | 'rate_limited';
    cache: 'operational';
  };
  scoringWeights: {
    marketDemand: number;
    transferability: number;
    aiExposure: number;
    skillBreadth: number;
    emergingAlignment: number;
  };
  algorithmVersion: string;
  aiModelVersion: string;
  rolesEvaluated: number;
  recommendationsGenerated: number;
  fallbackParserUsed: boolean;
  warnings: string[];
}

export interface AnalysisRun {
  id: string;
  userId: string;
  createdAt: string;
  profileVersion: string;
  marketSnapshotIds: string[];
  algorithmVersion: string;
  scoringWeights: Record<string, number>;
  modelVersion: string;
  dataSources: string[];
  overallScore: number;
  confidence: number;
  dataQuality: string;
}
