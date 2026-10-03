import { RoleDefinition, TransitionRecommendation, SkillGapItem } from '../types/transitions.ts';
import { TARGET_ROLES } from '../data/targetRoles.ts';
import { normalizeSkill, normalizeSkillList } from './skillNormalizationService.ts';
import { calculateResilienceScore } from './resilienceEngine.ts';
import { MarketSnapshot } from '../types/market.ts';

/**
 * Computes deterministic transition recommendations across all 20 target roles
 * based on the user's actual skills.
 */
export function calculateTransitionRecommendations(
  userSkills: string[],
  currentRoleTitle?: string | null,
  marketSnapshot?: MarketSnapshot | null
): TransitionRecommendation[] {
  const { normalized } = normalizeSkillList(userSkills);
  const userSkillNames = new Set(normalized.map(s => s.name.toLowerCase()));
  const currentResilience = calculateResilienceScore(userSkills, marketSnapshot).overallScore;

  const recommendations: TransitionRecommendation[] = [];

  for (const role of TARGET_ROLES) {
    // Avoid recommending the exact identical role as a transition target if user already has it
    const isSameRole = currentRoleTitle &&
      role.title.toLowerCase().trim() === currentRoleTitle.toLowerCase().trim();

    const allRoleSkills = Array.from(new Set([
      ...role.coreSkills,
      ...role.secondarySkills,
      ...role.emergingSkills
    ]));

    const alreadyHave: string[] = [];
    const missing: SkillGapItem[] = [];

    let coreOverlapCount = 0;
    let totalCore = role.coreSkills.length;

    for (const skillName of allRoleSkills) {
      const isCore = role.coreSkills.includes(skillName);
      const isEmerging = role.emergingSkills.includes(skillName);
      const isUserHas = userSkillNames.has(skillName.toLowerCase());

      if (isUserHas) {
        alreadyHave.push(skillName);
        if (isCore) coreOverlapCount++;
      } else {
        const normSkill = normalizeSkill(skillName);
        const priority: 'High' | 'Medium' | 'Low' = isCore ? 'High' : (isEmerging ? 'High' : 'Medium');
        const effortWeeks = isCore ? 4 : (isEmerging ? 3 : 2);

        missing.push({
          skill: skillName,
          category: normSkill?.category || 'General',
          isExisting: false,
          priority,
          estimatedEffortWeeks: effortWeeks,
          marketRelevance: normSkill?.baselineDemandIndex || 80,
          aiExposureLevel: normSkill?.aiExposureLevel || 'Moderate',
          transferabilityPotential: normSkill?.transferabilityScore || 80,
          whyNeeded: isCore
            ? `Fundamental core competency for ${role.title}.`
            : (isEmerging ? `High-leverage frontier skill differentiating modern ${role.title} candidates.` : `Key supporting infrastructure skill.`)
        });
      }
    }

    // Sort missing skills by priority (High first) then effort
    missing.sort((a, b) => {
      const prioWeight = { High: 3, Medium: 2, Low: 1 };
      return prioWeight[b.priority] - prioWeight[a.priority];
    });

    // 1. Skill Overlap Percentage
    const totalRequiredSkills = allRoleSkills.length;
    const overlapRatio = alreadyHave.length / Math.max(1, totalRequiredSkills);
    const overlapPercentage = Math.round(overlapRatio * 100);

    // 2. Transferability Score
    // Calculate how transferable the user's existing skills are to this role
    let transferSum = 0;
    for (const s of normalized) {
      transferSum += s.transferabilityScore;
    }
    const transferScore = normalized.length > 0
      ? Math.round(transferSum / normalized.length)
      : 50;

    // 3. Market Alignment
    const marketAlignmentScore = role.resilienceBaseline;

    // 4. Resilience Potential
    // If the user acquires the top 2-3 missing core skills, what is the new projected resilience?
    const projectedSkills = [...userSkills, ...missing.slice(0, 3).map(m => m.skill)];
    const projectedResilience = calculateResilienceScore(projectedSkills, marketSnapshot).overallScore;
    const resilienceDelta = Math.max(0, projectedResilience - currentResilience);

    // 5. Gap Effort Penalty
    const totalEffortWeeks = missing.reduce((acc, m) => acc + m.estimatedEffortWeeks, 0);
    // e.g. 10 weeks effort = penalty of 8-15 points
    const gapEffortPenalty = Math.min(25, Math.round(totalEffortWeeks * 0.7));

    // Transition Fit Formula:
    // Fit = (Overlap * 0.40) + (Transferability * 0.20) + (Market * 0.25) + (ResilienceDelta * 0.15) - (GapEffortPenalty * 0.5)
    let rawFit = (overlapPercentage * 0.40) +
                 (transferScore * 0.20) +
                 (marketAlignmentScore * 0.25) +
                 (Math.min(25, resilienceDelta * 2) * 0.15) -
                 (gapEffortPenalty * 0.5);

    // If identical role, reduce priority slightly so new transitions stand out, unless user has very few skills
    if (isSameRole) {
      rawFit -= 15;
    }

    const fitScore = Math.min(98, Math.max(25, Math.round(rawFit)));

    // Rationale generation
    const coreOverlapStr = coreOverlapCount > 0
      ? `${coreOverlapCount} of ${totalCore} core competencies already secured (${alreadyHave.slice(0, 3).join(', ')})`
      : `High transferability from current background`;

    const topGapsStr = missing.slice(0, 2).map(m => m.skill).join(' and ');
    const rationale = `Strong synergy: ${coreOverlapStr}. Strategic upskilling in ${topGapsStr || 'frontier toolsets'} provides an estimated +${resilienceDelta} point resilience uplift with ~${totalEffortWeeks} weeks estimated effort.`;

    recommendations.push({
      id: `rec-${role.id}`,
      targetRole: role,
      fitScore,
      skillOverlapPercentage: overlapPercentage,
      transferabilityScore: transferScore,
      marketAlignmentScore,
      resiliencePotentialScore: projectedResilience,
      gapEffortPenalty,
      existingSkillsCount: alreadyHave.length,
      missingSkillsCount: missing.length,
      alreadyHaveSkills: alreadyHave,
      needToDevelopSkills: missing,
      rationale,
      estimatedTransitionWeeks: Math.max(4, totalEffortWeeks),
      projectedResilienceDelta: resilienceDelta
    });
  }

  // Sort descending by fit score
  recommendations.sort((a, b) => b.fitScore - a.fitScore);

  return recommendations;
}
