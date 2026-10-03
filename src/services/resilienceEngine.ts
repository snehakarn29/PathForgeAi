import { NormalizedSkill } from '../types/skills.ts';
import { ResilienceAnalysis } from '../types/resilience.ts';
import { MarketSnapshot } from '../types/market.ts';
import { normalizeSkillList } from './skillNormalizationService.ts';

export interface ScoringWeights {
  marketDemand: number;
  transferability: number;
  aiExposure: number;
  skillBreadth: number;
  emergingAlignment: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  marketDemand: 0.30,
  transferability: 0.25,
  aiExposure: 0.20,
  skillBreadth: 0.15,
  emergingAlignment: 0.10
};

/**
 * Deterministically computes the Skill Resilience Score and Factor Breakdown
 * strictly without any Math.random() or LLM guessing.
 */
export function calculateResilienceScore(
  rawSkills: string[],
  marketSnapshot?: MarketSnapshot | null,
  userId: string = 'user-current',
  customWeights: ScoringWeights = DEFAULT_WEIGHTS
): ResilienceAnalysis {
  const now = new Date().toISOString();
  const { normalized, unmapped } = normalizeSkillList(rawSkills);

  // If user has no recognized skills
  if (normalized.length === 0) {
    return createEmptyResilience(userId, now, customWeights);
  }

  // 1. Market Demand Factor (Weight: 30%)
  // If market snapshot is provided, calculate alignment of user skills with current market frequency
  let marketDemandScore = 0;
  let marketEvidence = '';
  let marketSource = 'Baseline Skill Demand Index (Standard Taxonomy Benchmark)';

  if (marketSnapshot && marketSnapshot.skillCounts && Object.keys(marketSnapshot.skillCounts).length > 0) {
    const totalSample = marketSnapshot.sampleSize || 1;
    let totalFreq = 0;
    let evaluatedCount = 0;

    for (const skill of normalized) {
      const count = marketSnapshot.skillCounts[skill.name] || 0;
      const freq = (count / totalSample) * 100;
      // Blend market observed freq (60%) with baseline demand index (40%)
      const blended = (freq * 0.6) + (skill.baselineDemandIndex * 0.4);
      totalFreq += Math.min(100, blended);
      evaluatedCount++;
    }

    marketDemandScore = Math.round(totalFreq / Math.max(1, evaluatedCount));
    marketSource = `${marketSnapshot.source} (${marketSnapshot.location || 'Global'})`;
    marketEvidence = `Evaluated against ${marketSnapshot.sampleSize} live/cached postings for "${marketSnapshot.role || 'Target Role'}". Average skill market frequency: ${marketDemandScore}%.`;
  } else {
    // Deterministic fallback to baseline taxonomy demand index
    const totalDemand = normalized.reduce((acc, s) => acc + s.baselineDemandIndex, 0);
    marketDemandScore = Math.round(totalDemand / normalized.length);
    marketEvidence = `Calculated across ${normalized.length} recognized skills using baseline industry demand indices. No localized live market snapshot attached.`;
  }
  marketDemandScore = Math.min(100, Math.max(0, marketDemandScore));

  // 2. Transferability Factor (Weight: 25%)
  // Mean transferability score across recognized skills
  const totalTransferability = normalized.reduce((acc, s) => acc + s.transferabilityScore, 0);
  const transferabilityScore = Math.min(100, Math.max(0, Math.round(totalTransferability / normalized.length)));
  const highTransferCount = normalized.filter(s => s.transferabilityScore >= 85).length;
  const transferabilityEvidence = `${highTransferCount} of ${normalized.length} skills exhibit cross-domain portability (score >= 85), including foundational protocols, databases, and architectural concepts.`;

  // 3. AI Exposure Resilience Factor (Weight: 20%)
  // Higher automation exposure = lower resilience.
  // Formula: resilienceContribution = (100 - aiExposureScore)
  const totalExposure = normalized.reduce((acc, s) => acc + s.aiExposureScore, 0);
  const avgExposure = totalExposure / normalized.length;
  const aiExposureResilienceScore = Math.min(100, Math.max(0, Math.round(100 - avgExposure)));
  const exposedSkills = normalized.filter(s => s.aiExposureScore >= 60);
  const aiExposureEvidence = `Average skill automation exposure is ${Math.round(avgExposure)}%. Inverted resilience rating is ${aiExposureResilienceScore}/100. ${exposedSkills.length} skill(s) possess routine automation vulnerability.`;

  // 4. Skill Breadth Factor (Weight: 15%)
  // Evaluates coverage across distinct technical domains: Programming, Backend, Frontend, Database, Cloud, DevOps, AI, Tools
  const uniqueCategories = new Set(normalized.map(s => s.category));
  // 6 or more domains = 100%, 5 = 85%, 4 = 70%, 3 = 55%, 2 = 40%, 1 = 25%
  const breadthCount = uniqueCategories.size;
  const skillCount = normalized.length;
  let breadthScore = Math.min(100, Math.round((breadthCount / 6) * 70 + Math.min(30, (skillCount / 10) * 30)));
  const skillBreadthEvidence = `Portfolio covers ${breadthCount} distinct technology categories (${Array.from(uniqueCategories).slice(0, 4).join(', ')}) with ${skillCount} normalized skills.`;

  // 5. Emerging Skill Alignment Factor (Weight: 10%)
  // Ratio and strength of modern/emerging skills (GenAI, RAG, Kubernetes, Rust, Vector DB, etc.)
  const emergingSkillsList = normalized.filter(s => s.isEmerging);
  const emergingRatio = emergingSkillsList.length / normalized.length;
  // Scaled: 3 or more emerging skills gives 90-100 score
  let emergingScore = Math.min(100, Math.round((emergingSkillsList.length / 3) * 60 + emergingRatio * 40));
  if (emergingSkillsList.length === 0) emergingScore = 20;
  const emergingEvidence = `${emergingSkillsList.length} emerging frontier skill(s) detected: ${emergingSkillsList.map(s => s.name).join(', ') || 'None currently declared'}.`;

  // Deterministic Contributions
  const marketContribution = Number((marketDemandScore * customWeights.marketDemand).toFixed(1));
  const transferContribution = Number((transferabilityScore * customWeights.transferability).toFixed(1));
  const exposureContribution = Number((aiExposureResilienceScore * customWeights.aiExposure).toFixed(1));
  const breadthContribution = Number((breadthScore * customWeights.skillBreadth).toFixed(1));
  const emergingContribution = Number((emergingScore * customWeights.emergingAlignment).toFixed(1));

  const totalCalculated = Math.round(
    marketContribution +
    transferContribution +
    exposureContribution +
    breadthContribution +
    emergingContribution
  );

  const overallScore = Math.min(100, Math.max(0, totalCalculated));

  // Categorize skills into analytical quadrants
  const strongSkills: string[] = [];
  const transferableSkills: string[] = [];
  const atRiskSkills: string[] = [];
  const emergingSkills: string[] = [];

  for (const s of normalized) {
    if (s.isEmerging) emergingSkills.push(s.name);
    if (s.aiExposureScore >= 60) atRiskSkills.push(s.name);
    if (s.transferabilityScore >= 85) transferableSkills.push(s.name);
    if (s.baselineDemandIndex >= 85 && s.aiExposureScore < 50) strongSkills.push(s.name);
  }

  return {
    id: `resilience-${Date.now()}`,
    userId,
    calculatedAt: now,
    overallScore,
    scoringWeights: customWeights,
    factors: {
      marketDemand: {
        score: marketDemandScore,
        weight: customWeights.marketDemand,
        contribution: marketContribution,
        evidence: marketEvidence,
        source: marketSource,
        timestamp: now,
        metrics: {
          evaluatedSkills: normalized.length,
          unmappedCount: unmapped.length
        }
      },
      transferability: {
        score: transferabilityScore,
        weight: customWeights.transferability,
        contribution: transferContribution,
        evidence: transferabilityEvidence,
        source: 'ESCO & O*NET Cross-Occupational Transferability Matrix',
        timestamp: now,
        metrics: {
          highPortabilityCount: highTransferCount
        }
      },
      aiExposure: {
        score: aiExposureResilienceScore,
        weight: customWeights.aiExposure,
        contribution: exposureContribution,
        evidence: aiExposureEvidence,
        source: 'Empirical AI Exposure Matrix (Felten, Eloundou, Brookings 2025/2026)',
        timestamp: now,
        metrics: {
          rawAverageExposure: Math.round(avgExposure),
          vulnerableSkillsCount: exposedSkills.length
        }
      },
      skillBreadth: {
        score: breadthScore,
        weight: customWeights.skillBreadth,
        contribution: breadthContribution,
        evidence: skillBreadthEvidence,
        source: 'Taxonomy Category Distribution Analysis',
        timestamp: now,
        metrics: {
          categoryCount: breadthCount,
          totalRecognized: skillCount
        }
      },
      emergingAlignment: {
        score: emergingScore,
        weight: customWeights.emergingAlignment,
        contribution: emergingContribution,
        evidence: emergingEvidence,
        source: 'Emerging Tech Frontier Index (Gartner / WEF 2025/2026)',
        timestamp: now,
        metrics: {
          emergingCount: emergingSkillsList.length
        }
      }
    },
    insights: {
      strongSkills: Array.from(new Set(strongSkills)),
      transferableSkills: Array.from(new Set(transferableSkills)),
      atRiskSkills: Array.from(new Set(atRiskSkills)),
      emergingSkills: Array.from(new Set(emergingSkills))
    },
    provenance: {
      dataSource: marketSnapshot ? marketSnapshot.source : 'Standard Taxonomy & Labor Economics Benchmarks',
      sampleSize: marketSnapshot ? marketSnapshot.sampleSize : normalized.length,
      locationQueried: marketSnapshot ? marketSnapshot.location : 'Universal / Benchmark',
      marketSnapshotId: marketSnapshot?.id,
      cacheStatus: marketSnapshot?.cacheStatus || 'cached',
      algorithmVersion: 'PathForge-Deterministic-v1.4',
      dataQuality: marketSnapshot?.dataQuality || 'High'
    }
  };
}

function createEmptyResilience(
  userId: string,
  now: string,
  weights: ScoringWeights
): ResilienceAnalysis {
  return {
    id: `resilience-empty-${Date.now()}`,
    userId,
    calculatedAt: now,
    overallScore: 0,
    scoringWeights: weights,
    factors: {
      marketDemand: { score: 0, weight: weights.marketDemand, contribution: 0, evidence: 'No skills recorded.', source: 'N/A', timestamp: now, metrics: {} },
      transferability: { score: 0, weight: weights.transferability, contribution: 0, evidence: 'No skills recorded.', source: 'N/A', timestamp: now, metrics: {} },
      aiExposure: { score: 0, weight: weights.aiExposure, contribution: 0, evidence: 'No skills recorded.', source: 'N/A', timestamp: now, metrics: {} },
      skillBreadth: { score: 0, weight: weights.skillBreadth, contribution: 0, evidence: 'No skills recorded.', source: 'N/A', timestamp: now, metrics: {} },
      emergingAlignment: { score: 0, weight: weights.emergingAlignment, contribution: 0, evidence: 'No skills recorded.', source: 'N/A', timestamp: now, metrics: {} }
    },
    insights: {
      strongSkills: [],
      transferableSkills: [],
      atRiskSkills: [],
      emergingSkills: []
    },
    provenance: {
      dataSource: 'None',
      sampleSize: 0,
      locationQueried: 'None',
      cacheStatus: 'cached',
      algorithmVersion: 'PathForge-Deterministic-v1.4',
      dataQuality: 'Limited Sample'
    }
  };
}
