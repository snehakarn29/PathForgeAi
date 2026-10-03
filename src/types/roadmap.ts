export interface LearningResource {
  title: string;
  provider: 'NPTEL' | 'SWAYAM' | 'Microsoft Learn' | 'Google' | 'IBM SkillsBuild' | 'Official Documentation' | 'Coursera / Open' | 'FreeCodeCamp';
  skill: string;
  url: string;
  cost: 'Free' | 'Audit Free' | 'Paid';
  durationHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  verifiedUrl: boolean;
}

export interface RoadmapMilestone {
  id: string;
  weekStart: number;
  weekEnd: number;
  phaseTitle: string;
  targetSkills: string[];
  objectives: string[];
  resources: LearningResource[];
  projectIdea: {
    title: string;
    description: string;
    deliverable: string;
  };
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface LearningRoadmap {
  id: string;
  userId: string;
  targetRoleId: string;
  targetRoleTitle: string;
  totalDurationWeeks: number;
  createdAt: string;
  milestones: RoadmapMilestone[];
  readinessGainEstimate: number;
}
