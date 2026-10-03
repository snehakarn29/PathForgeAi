import { LearningResource } from '../types/roadmap.ts';

export const VERIFIED_LEARNING_RESOURCES: LearningResource[] = [
  // Python
  {
    title: 'Python for Beginners & Standard Library Documentation',
    provider: 'Official Documentation',
    skill: 'Python',
    url: 'https://docs.python.org/3/tutorial/',
    cost: 'Free',
    durationHours: 25,
    difficulty: 'Beginner',
    verifiedUrl: true
  },
  {
    title: 'The Joy of Computing using Python',
    provider: 'NPTEL',
    skill: 'Python',
    url: 'https://nptel.ac.in/courses/106106182',
    cost: 'Free',
    durationHours: 36,
    difficulty: 'Beginner',
    verifiedUrl: true
  },
  // GenAI / LLM APIs / Prompt Engineering
  {
    title: 'Generative AI for Developers & Prompt Engineering',
    provider: 'Google',
    skill: 'LLM APIs & Prompt Engineering',
    url: 'https://www.cloudskillsboost.google/course_templates/536',
    cost: 'Free',
    durationHours: 15,
    difficulty: 'Intermediate',
    verifiedUrl: true
  },
  {
    title: 'Build Apps with Large Language Models & Prompt Engineering',
    provider: 'Microsoft Learn',
    skill: 'LLM APIs & Prompt Engineering',
    url: 'https://learn.microsoft.com/en-us/training/paths/develop-language-solutions-azure-openai/',
    cost: 'Free',
    durationHours: 18,
    difficulty: 'Intermediate',
    verifiedUrl: true
  },
  // RAG & Vector DB
  {
    title: 'Retrieval Augmented Generation (RAG) Fundamentals',
    provider: 'IBM SkillsBuild',
    skill: 'Retrieval Augmented Generation (RAG)',
    url: 'https://skillsbuild.org/students/course-catalog',
    cost: 'Free',
    durationHours: 20,
    difficulty: 'Advanced',
    verifiedUrl: true
  },
  {
    title: 'Vector Search & Embeddings with PostgreSQL pgvector',
    provider: 'Official Documentation',
    skill: 'Vector Databases',
    url: 'https://github.com/pgvector/pgvector',
    cost: 'Free',
    durationHours: 12,
    difficulty: 'Intermediate',
    verifiedUrl: true
  },
  // Agentic Workflows
  {
    title: 'Building Agentic AI Systems & Multi-Agent Architectures',
    provider: 'Microsoft Learn',
    skill: 'Agentic Workflows & Multi-Agent Systems',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/agents/',
    cost: 'Free',
    durationHours: 22,
    difficulty: 'Advanced',
    verifiedUrl: true
  },
  // Docker & Containers
  {
    title: 'Docker Getting Started & Container Orchestration Guide',
    provider: 'Official Documentation',
    skill: 'Docker',
    url: 'https://docs.docker.com/get-started/',
    cost: 'Free',
    durationHours: 14,
    difficulty: 'Beginner',
    verifiedUrl: true
  },
  // Kubernetes
  {
    title: 'Kubernetes Official Documentation & Interactive Tutorials',
    provider: 'Official Documentation',
    skill: 'Kubernetes',
    url: 'https://kubernetes.io/docs/tutorials/',
    cost: 'Free',
    durationHours: 28,
    difficulty: 'Advanced',
    verifiedUrl: true
  },
  // FastAPI
  {
    title: 'FastAPI Interactive Tutorial & High Performance Web APIs',
    provider: 'Official Documentation',
    skill: 'FastAPI',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    cost: 'Free',
    durationHours: 16,
    difficulty: 'Intermediate',
    verifiedUrl: true
  },
  // SQL & Databases
  {
    title: 'Database Management Systems & Relational Design',
    provider: 'NPTEL',
    skill: 'SQL',
    url: 'https://nptel.ac.in/courses/106105175',
    cost: 'Free',
    durationHours: 40,
    difficulty: 'Intermediate',
    verifiedUrl: true
  },
  {
    title: 'PostgreSQL Official Documentation & Administration Manual',
    provider: 'Official Documentation',
    skill: 'PostgreSQL',
    url: 'https://www.postgresql.org/docs/current/tutorial.html',
    cost: 'Free',
    durationHours: 20,
    difficulty: 'Intermediate',
    verifiedUrl: true
  },
  // Machine Learning & MLOps
  {
    title: 'Machine Learning Foundations and Applications',
    provider: 'SWAYAM',
    skill: 'Machine Learning',
    url: 'https://swayam.gov.in/explorer?category=Computer_Science',
    cost: 'Free',
    durationHours: 35,
    difficulty: 'Intermediate',
    verifiedUrl: true
  },
  {
    title: 'MLOps: Operationalizing Machine Learning Models in Production',
    provider: 'Google',
    skill: 'MLOps',
    url: 'https://www.cloudskillsboost.google/paths/17',
    cost: 'Free',
    durationHours: 24,
    difficulty: 'Advanced',
    verifiedUrl: true
  },
  // Cloud & AWS
  {
    title: 'AWS Cloud Practitioner & Architecture Foundations',
    provider: 'Official Documentation',
    skill: 'AWS',
    url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/',
    cost: 'Free',
    durationHours: 18,
    difficulty: 'Beginner',
    verifiedUrl: true
  },
  // TypeScript & React
  {
    title: 'TypeScript Handbook & Modern Language Guide',
    provider: 'Official Documentation',
    skill: 'TypeScript',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    cost: 'Free',
    durationHours: 16,
    difficulty: 'Intermediate',
    verifiedUrl: true
  },
  {
    title: 'React Documentation & Interactive Quick Start',
    provider: 'Official Documentation',
    skill: 'React',
    url: 'https://react.dev/learn',
    cost: 'Free',
    durationHours: 20,
    difficulty: 'Beginner',
    verifiedUrl: true
  },
  // System Design
  {
    title: 'Cloud Architecture Center & Enterprise System Design',
    provider: 'Google',
    skill: 'System Design',
    url: 'https://cloud.google.com/architecture',
    cost: 'Free',
    durationHours: 26,
    difficulty: 'Advanced',
    verifiedUrl: true
  },
  // Data Engineering
  {
    title: 'Big Data Computing and Distributed Processing',
    provider: 'NPTEL',
    skill: 'Data Engineering',
    url: 'https://nptel.ac.in/courses/106104189',
    cost: 'Free',
    durationHours: 32,
    difficulty: 'Advanced',
    verifiedUrl: true
  }
];

export function getResourcesForSkill(skillName: string): LearningResource[] {
  const norm = skillName.toLowerCase();
  return VERIFIED_LEARNING_RESOURCES.filter(
    r => r.skill.toLowerCase() === norm ||
         r.skill.toLowerCase().includes(norm) ||
         norm.includes(r.skill.toLowerCase())
  );
}
