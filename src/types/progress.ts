export interface TrackedSkill {
  name: string;
  category: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  hoursSpent: number;
}

export interface UserProgress {
  userId: string;
  trackedSkills: Record<string, TrackedSkill>;
  completedMilestoneIds: string[];
  totalHoursStudied: number;
  lastActive: string;
  notes: string;
}
