export interface FactorScoreDetail {
  score: number; // 0 - 100
  weight: number; // e.g. 0.30
  contribution: number; // score * weight
  evidence: string;
  source: string;
  timestamp: string;
  metrics: Record<string, string | number>;
}

export interface ResilienceAnalysis {
  id: string;
  userId: string;
  calculatedAt: string;
  overallScore: number; // 0 - 100
  isSimulated?: boolean;
  scoringWeights: {
    marketDemand: number;
    transferability: number;
    aiExposure: number;
    skillBreadth: number;
    emergingAlignment: number;
  };
  factors: {
    marketDemand: FactorScoreDetail;
    transferability: FactorScoreDetail;
    aiExposure: FactorScoreDetail;
    skillBreadth: FactorScoreDetail;
    emergingAlignment: FactorScoreDetail;
  };
  insights: {
    strongSkills: string[];
    transferableSkills: string[];
    atRiskSkills: string[];
    emergingSkills: string[];
  };
  provenance: {
    dataSource: string;
    sampleSize: number;
    locationQueried: string;
    marketSnapshotId?: string;
    cacheStatus: 'live' | 'cached' | 'demo';
    algorithmVersion: string;
    dataQuality: string;
  };
}
