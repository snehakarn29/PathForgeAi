import { NormalizedSkill } from '../types/skills.ts';
import { RoleDefinition, TransitionRecommendation } from '../types/transitions.ts';
import { MarketSnapshot } from '../types/market.ts';
import { TARGET_ROLES } from '../data/targetRoles.ts';
import { calculateTransitionRecommendations } from './transitionEngine.ts';
import { normalizeSkillList } from './skillNormalizationService.ts';

// ----------------------------------------------------
// 1. Demand Forecasting Interface & Rule-Based Implementation
// ----------------------------------------------------
export interface DemandForecastingProvider {
  forecastDemand(skill: NormalizedSkill, horizonMonths: number): {
    predictedDemandIndex: number;
    trendDirection: 'Growing' | 'Stable' | 'Declining';
    confidenceInterval: [number, number];
    isMleModel: boolean;
  };
}

export class RuleBasedDemandProvider implements DemandForecastingProvider {
  forecastDemand(skill: NormalizedSkill, horizonMonths: number) {
    // Deterministic projection based on taxonomy emerging status and baseline demand
    let trend: 'Growing' | 'Stable' | 'Declining' = 'Stable';
    let delta = 0;

    if (skill.isEmerging) {
      trend = 'Growing';
      delta = Math.min(15, Math.round(horizonMonths * 1.2));
    } else if (skill.aiExposureScore >= 65) {
      trend = 'Declining';
      delta = -Math.min(12, Math.round(horizonMonths * 0.9));
    }

    const predicted = Math.min(100, Math.max(20, skill.baselineDemandIndex + delta));
    return {
      predictedDemandIndex: predicted,
      trendDirection: trend,
      confidenceInterval: [Math.max(10, predicted - 8), Math.min(100, predicted + 8)] as [number, number],
      isMleModel: false // Explicitly honest about rule-based status
    };
  }
}

// ----------------------------------------------------
// 2. Skill Embedding Interface & Taxonomy Implementation
// ----------------------------------------------------
export interface SkillEmbeddingProvider {
  getSkillSimilarity(skillA: string, skillB: string): number; // 0 to 1
  isMleModel: boolean;
}

export class TaxonomySkillProvider implements SkillEmbeddingProvider {
  isMleModel = false;

  getSkillSimilarity(skillA: string, skillB: string): number {
    if (skillA.toLowerCase() === skillB.toLowerCase()) return 1.0;
    const { normalized } = normalizeSkillList([skillA, skillB]);
    if (normalized.length < 2) return 0.2;

    const [s1, s2] = normalized;
    if (s1.category === s2.category) {
      return 0.75;
    }
    // High synergy cross-categories (e.g. Programming + Backend)
    const synergyPairs = [
      ['Programming', 'Backend'],
      ['Backend', 'Database'],
      ['Cloud', 'DevOps'],
      ['AI', 'ML'],
      ['ML', 'GenAI']
    ];

    for (const [c1, c2] of synergyPairs) {
      if ((s1.category === c1 && s2.category === c2) || (s1.category === c2 && s2.category === c1)) {
        return 0.60;
      }
    }

    return 0.25;
  }
}

// ----------------------------------------------------
// 3. Role Recommendation Interface & Deterministic Implementation
// ----------------------------------------------------
export interface RoleRecommendationProvider {
  recommendTransitions(
    userSkills: string[],
    currentRoleTitle?: string | null,
    snapshot?: MarketSnapshot | null
  ): TransitionRecommendation[];
  isMleModel: boolean;
}

export class DeterministicRoleRecommendationProvider implements RoleRecommendationProvider {
  isMleModel = false;

  recommendTransitions(
    userSkills: string[],
    currentRoleTitle?: string | null,
    snapshot?: MarketSnapshot | null
  ): TransitionRecommendation[] {
    return calculateTransitionRecommendations(userSkills, currentRoleTitle, snapshot);
  }
}
