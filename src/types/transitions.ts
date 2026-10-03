import { MLTransitionPrediction } from './ml.ts';

export interface RoleDefinition {
  id: string;
  title: string;
  category: string;
  description: string;
  typicalYearsExperience?: number;
  coreSkills: string[];
  secondarySkills: string[];
  emergingSkills: string[];
  growthTrend: 'High Growth' | 'Stable' | 'Transforming' | 'Emerging';
  averageSalaryBand?: string;
  resilienceBaseline: number; // 0 - 100
}

export interface SkillGapItem {
  skill: string;
  category: string;
  isExisting: boolean;
  priority: 'High' | 'Medium' | 'Low';
  estimatedEffortWeeks: number;
  marketRelevance: number; // 0 - 100
  aiExposureLevel: string;
  transferabilityPotential: number;
  whyNeeded: string;
}

export interface TransitionRecommendation {
  id: string;
  targetRole: RoleDefinition;
  fitScore: number; // 0 - 100
  skillOverlapPercentage: number;
  transferabilityScore: number;
  marketAlignmentScore: number;
  resiliencePotentialScore: number;
  gapEffortPenalty: number;
  existingSkillsCount: number;
  missingSkillsCount: number;
  alreadyHaveSkills: string[];
  needToDevelopSkills: SkillGapItem[];
  rationale: string;
  estimatedTransitionWeeks: number;
  projectedResilienceDelta: number; // e.g. +14 points
  mlReadiness?: MLTransitionPrediction;
}
