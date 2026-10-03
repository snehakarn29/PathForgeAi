export type SkillCategory =
  | 'Programming'
  | 'Backend'
  | 'Frontend'
  | 'Database'
  | 'Cloud'
  | 'DevOps'
  | 'AI'
  | 'ML'
  | 'GenAI'
  | 'Data'
  | 'Cybersecurity'
  | 'Testing'
  | 'Architecture'
  | 'Tools'
  | 'Soft Skills';

export type ExposureLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface NormalizedSkill {
  id: string;
  name: string;
  category: SkillCategory;
  aliases: string[];
  escoUri?: string;
  onetCode?: string;
  transferabilityScore: number; // 0 - 100
  isEmerging: boolean;
  baselineDemandIndex: number; // 0 - 100
  aiExposureScore: number; // 0 - 100 (higher = more exposed to automation)
  aiExposureLevel: ExposureLevel;
  exposureReason: string;
  evidenceSource: string;
  evidenceDate: string;
  confidence: number;
  version: string;
}

export interface UserSkillInsight {
  skill: NormalizedSkill;
  userProficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  userDeclared: boolean;
  marketDemandScore: number;
  effectiveResilience: number; // inverted exposure combined with transferability
  status: 'Strong / Market-aligned' | 'Stable / Transferable' | 'At-risk / High exposure' | 'Emerging / Opportunity';
}
