import { LearningRoadmap, RoadmapMilestone } from '../types/roadmap.ts';
import { TransitionRecommendation } from '../types/transitions.ts';
import { getResourcesForSkill } from '../data/verifiedResources.ts';

export function generateLearningRoadmap(
  recommendation: TransitionRecommendation,
  userId: string = 'user-current'
): LearningRoadmap {
  const missingSkills = recommendation.needToDevelopSkills;
  const targetRole = recommendation.targetRole;

  // Split missing skills into 3 phases:
  // Phase 1: Core Fundamentals & Language/API essentials (Weeks 1-3)
  // Phase 2: Core Domain Architecture & Frameworks (Weeks 4-7)
  // Phase 3: Advanced Systems, Integration & Capstone (Weeks 8-10 or 12)
  const highPriority = missingSkills.filter(s => s.priority === 'High');
  const otherPriority = missingSkills.filter(s => s.priority !== 'High');

  const p1Skills = highPriority.slice(0, 2).map(s => s.skill);
  if (p1Skills.length === 0 && missingSkills.length > 0) {
    p1Skills.push(missingSkills[0].skill);
  }

  const p2Skills = highPriority.slice(2, 4).concat(otherPriority.slice(0, 2)).map(s => s.skill);
  if (p2Skills.length === 0 && missingSkills.length > 1) {
    p2Skills.push(missingSkills[1].skill);
  }

  const p3Skills = highPriority.slice(4).concat(otherPriority.slice(2)).map(s => s.skill);
  if (p3Skills.length === 0 && missingSkills.length > 2) {
    p3Skills.push(missingSkills[2].skill);
  }

  const milestones: RoadmapMilestone[] = [];

  // Milestone 1
  const m1Resources = p1Skills.flatMap(s => getResourcesForSkill(s));
  milestones.push({
    id: `m1-${targetRole.id}`,
    weekStart: 1,
    weekEnd: 3,
    phaseTitle: 'Phase 1: Foundational Syntax, Protocols & APIs',
    targetSkills: p1Skills.length > 0 ? p1Skills : [targetRole.coreSkills[0]],
    objectives: [
      `Master idiomatic syntax and asynchronous runtime execution in ${p1Skills.join(' & ') || targetRole.coreSkills[0]}.`,
      'Configure local dev environments, linters, typing configurations, and interactive REPL workflows.',
      'Construct standalone test harnesses verifying data serialization and error response structures.'
    ],
    resources: m1Resources.length > 0 ? m1Resources.slice(0, 3) : getResourcesForSkill('Python'),
    projectIdea: {
      title: `${targetRole.title} Foundation Utility`,
      description: `Build an asynchronous CLI and service client incorporating ${p1Skills.join(' and ') || 'core protocols'}.`,
      deliverable: 'Clean GitHub repository with automated tests and Dockerized runner.'
    },
    status: 'not_started'
  });

  // Milestone 2
  const m2Resources = p2Skills.flatMap(s => getResourcesForSkill(s));
  milestones.push({
    id: `m2-${targetRole.id}`,
    weekStart: 4,
    weekEnd: 7,
    phaseTitle: 'Phase 2: Architectural Patterns, Storage & Tooling',
    targetSkills: p2Skills.length > 0 ? p2Skills : [targetRole.coreSkills[1] || 'REST APIs'],
    objectives: [
      `Implement persistent storage schemas, indexing strategies, and vector/relational pipelines for ${p2Skills.join(' & ') || 'core stack'}.`,
      'Establish contract-driven API schemas with telemetry logging, rate limiting, and caching layers.',
      'Design modular component abstractions decoupling external dependencies.'
    ],
    resources: m2Resources.length > 0 ? m2Resources.slice(0, 3) : getResourcesForSkill('Docker'),
    projectIdea: {
      title: 'High-Throughput Integration Pipeline',
      description: 'Develop an end-to-end service demonstrating data ingestion, transformation, and resilient storage retrieval.',
      deliverable: 'Running API endpoint with OpenAPI documentation and performance benchmark reports.'
    },
    status: 'not_started'
  });

  // Milestone 3
  const m3Resources = p3Skills.flatMap(s => getResourcesForSkill(s));
  milestones.push({
    id: `m3-${targetRole.id}`,
    weekStart: 8,
    weekEnd: 10,
    phaseTitle: 'Phase 3: Production Deployment, Hardening & Capstone',
    targetSkills: p3Skills.length > 0 ? p3Skills : [targetRole.emergingSkills[0] || 'System Design'],
    objectives: [
      'Containerize full solution with multi-stage production builds and automated CI/CD deployment.',
      'Implement observability (distributed tracing, structured JSON logs, health checks, error budgets).',
      'Conduct failure chaos simulations to verify automated recovery and graceful fallback behavior.'
    ],
    resources: m3Resources.length > 0 ? m3Resources.slice(0, 3) : getResourcesForSkill('System Design'),
    projectIdea: {
      title: `${targetRole.title} Production Capstone Portfolio Project`,
      description: `Complete enterprise-grade application simulating real-world production workload for ${targetRole.title}.`,
      deliverable: 'Live deployed application URL + architectural design document detailing latency, cost, and resilience metrics.'
    },
    status: 'not_started'
  });

  return {
    id: `roadmap-${targetRole.id}-${Date.now()}`,
    userId,
    targetRoleId: targetRole.id,
    targetRoleTitle: targetRole.title,
    totalDurationWeeks: 10,
    createdAt: new Date().toISOString(),
    milestones,
    readinessGainEstimate: recommendation.projectedResilienceDelta || 14
  };
}
